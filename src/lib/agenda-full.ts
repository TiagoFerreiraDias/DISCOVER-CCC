import { load } from "cheerio";
import { fetchCmPageHtml } from "@/lib/fetch-cm";

const BASE = "https://www.cm-santarem.pt";

export const AGENDA_LIST_PAGE = `${BASE}/descobrir-santarem/agenda-de-eventos`;

export type AgendaEventPayload = {
  title: string;
  link: string;
  pubDate: string | null;
  category?: string;
  excerpt: string;
  fullText: string;
  image?: string;
};

/** ID numérico do evento no iCagenda (ex.: …/1957-fna-2026-… → 1957). */
export function cmsEventIdFromPathOrUrl(s: string): string | null {
  const m = s.match(/(?:agenda-de-eventos|icagenda)\/(\d+)-/);
  return m?.[1] ?? null;
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return BASE + (pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
}

/**
 * Extrai caminhos de eventos a partir do HTML da lista (calendário + vista em lista).
 * O RSS municipal só traz 10 itens; aqui aparecem todos os links visíveis na página.
 */
export function extractListPaths(html: string): string[] {
  const found = new Set<string>();
  let m: RegExpExecArray | null;

  const r1 =
    /href="(\/descobrir-santarem\/agenda-de-eventos\/\d+-[^"?]+)"/gi;
  while ((m = r1.exec(html)) !== null) found.add(m[1]);

  const r2 = /href="(\/component\/icagenda\/\d+-[^"]+)"/gi;
  while ((m = r2.exec(html)) !== null) found.add(m[1]);

  return [...found];
}

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function parseEventDetailHtml(html: string): {
  title: string;
  pubDate: string | null;
  category?: string;
  image?: string;
  plain: string;
} {
  const $ = load(html);

  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().split("-")[0].trim() ||
    "Sem título";

  const metaDesc =
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  let image = $('meta[property="og:image"]').attr("content")?.trim();
  if (image?.startsWith("/")) image = BASE + image;

  const startD = $(".ic-period-startdate").first().text().trim();
  const startT = $(".ic-period-starttime").first().text().trim();
  let pubDate: string | null = null;
  if (startD) {
    const t = startT || "09:00";
    try {
      pubDate = new Date(`${startD}T${t}:00+01:00`).toISOString();
    } catch {
      pubDate = new Date(`${startD}T12:00:00Z`).toISOString();
    }
  }

  const cat =
    $(".ic-details-cat").first().text().trim() ||
    $(".title-cat").first().text().trim();

  let plain = $("#ic-detail-desc").text().replace(/\s+/g, " ").trim();
  if (!plain) plain = decodeBasicEntities(metaDesc);

  plain = plain.slice(0, 12_000);

  if (!image) {
    const src = $("#ic-detail-desc img").first().attr("src");
    if (src)
      image = src.startsWith("http")
        ? src
        : BASE + (src.startsWith("/") ? src : `/${src}`);
  }

  return {
    title: decodeBasicEntities(title),
    pubDate,
    category: cat || undefined,
    image,
    plain,
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      results[i] = await fn(items[i], i);
    }
  }

  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

export function collectPathsFromAgendaHtmls(htmls: string[]): string[] {
  const s = new Set<string>();
  for (const h of htmls) {
    for (const p of extractListPaths(h)) s.add(p);
  }
  return [...s];
}

/**
 * Junta itens do RSS (texto rico) com eventos que só aparecem no HTML da agenda.
 * Para cada ID em falta, pede a página de detalhe (datas + descrição).
 */
export async function mergeRssWithAgendaPaths(
  rssItems: AgendaEventPayload[],
  paths: string[]
): Promise<AgendaEventPayload[]> {
  const byId = new Map<string, AgendaEventPayload>();

  for (const it of rssItems) {
    const id = cmsEventIdFromPathOrUrl(it.link);
    if (id) byId.set(id, it);
    else byId.set(`x:${it.link}`, it);
  }

  const uniquePaths = [...new Set(paths)];
  const missing = uniquePaths.filter((p) => {
    const id = cmsEventIdFromPathOrUrl(p);
    return id && !byId.has(id);
  });

  const detailResults = await mapPool(missing, 4, async (path) => {
    const url = toAbsoluteUrl(path);
    try {
      const html = await fetchCmPageHtml(url);
      const p = parseEventDetailHtml(html);
      const id = cmsEventIdFromPathOrUrl(path);
      if (!id) return null;

      const excerpt =
        p.plain.length > 260
          ? `${p.plain.slice(0, 257).trim()}…`
          : p.plain;

      const item: AgendaEventPayload = {
        title: p.title,
        link: url,
        pubDate: p.pubDate,
        category: p.category,
        excerpt,
        fullText: p.plain,
        image: p.image,
      };
      return { id, item };
    } catch (e) {
      console.warn("agenda detail fetch failed:", url, e);
      return null;
    }
  });

  for (const row of detailResults) {
    if (row) byId.set(row.id, row.item);
  }

  return [...byId.values()].sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });
}
