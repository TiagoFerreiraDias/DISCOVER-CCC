import { NextResponse } from "next/server";
import https from 'https';

export const dynamic = "force-dynamic";

const AGENDA_URL = "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos?format=feed&type=rss";

const FALLBACK_EVENTS = [
  {
    id: "fna_2026",
    title: "FNA 2026 l Feira Nacional de Agricultura - Feira do Ribatejo",
    link: "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos",
    date: new Date().toISOString(),
    category: "Eventos",
    excerpt: "A Feira Nacional de Agricultura (FNA) é o evento mais importante do setor agrícola em Portugal, reunindo expositores, gastronomia, conferências e grandes concertos.",
    description: "A Feira Nacional de Agricultura (FNA) é o evento mais importante do setor agrícola em Portugal, reunindo expositores, gastronomia, conferências e grandes concertos no CNEMA. Um evento emblemático que celebra o Ribatejo.",
    image: "/nature.png",
    isFeatured: true
  },
  {
    id: "fics_2026",
    title: "19º FICS - Festival Internacional de Cinema de Santarém",
    link: "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos",
    date: new Date().toISOString(),
    category: "Cultura",
    excerpt: "O Festival Internacional de Cinema de Santarém (FICS) regressa com uma seleção fantástica de longas e curtas-metragens e debates no Teatro Sá da Bandeira.",
    description: "O Festival Internacional de Cinema de Santarém (FICS) regressa com uma seleção fantástica de longas e curtas-metragens e debates no Teatro Sá da Bandeira. Uma celebração da sétima arte.",
    image: "/monument.png",
    isFeatured: true
  },
  {
    id: "deco_atendimento",
    title: "Atendimento Jurista da DECO",
    link: "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos",
    date: new Date().toISOString(),
    category: "Serviços",
    excerpt: "Sessão de atendimento presencial e apoio ao consumidor dinamizada pelos juristas da DECO no Município de Santarém.",
    description: "Sessão de atendimento presencial e apoio ao consumidor dinamizada pelos juristas da DECO no Município de Santarém. Apoio em dúvidas financeiras, contratos e direitos do consumidor.",
    image: "/logo.png",
    isFeatured: false
  },
  {
    id: "concertos_primavera",
    title: "Ciclo de Concertos de Primavera no Teatro Sá da Bandeira",
    link: "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos",
    date: new Date().toISOString(),
    category: "Música",
    excerpt: "Um ciclo de concertos intimistas com grandes nomes da música nacional a decorrer no Teatro Sá da Bandeira de Santarém.",
    description: "Um ciclo de concertos intimistas com grandes nomes da música nacional a decorrer no Teatro Sá da Bandeira de Santarém. Uma co-produção do Município com artistas nacionais.",
    image: "/monument.png",
    isFeatured: false
  }
];

function stripHtml(s: string): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractImage(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1]) {
    const src = m[1];
    if (src.startsWith('http')) return src;
    return `https://www.cm-santarem.pt${src.startsWith('/') ? '' : '/'}${src}`;
  }
  return undefined;
}

async function fetchWithHttps(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const baseUrl = new URL(url);
          redirectUrl = `${baseUrl.protocol}//${baseUrl.host}${redirectUrl}`;
        }
        return fetchWithHttps(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

export async function GET() {
  try {
    const text = await fetchWithHttps(AGENDA_URL);
    if (!text || text.length < 100) {
      return NextResponse.json({ success: true, items: FALLBACK_EVENTS });
    }

    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const content = match[1];
      const title = content.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
      const link = content.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "";
      const description = content.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
      const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "";
      const category = content.match(/<category>([\s\S]*?)<\/category>/i)?.[1] || "Evento";

      const cleanTitle = title.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
      const cleanDesc = description.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
      const cleanLink = link.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
      const cleanCat = category.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();

      if (!cleanLink) continue;

      // FILTRO: Excluir eventos que sejam nas freguesias para manter só na cidade
      const catLower = cleanCat.toLowerCase();
      const titleLower = cleanTitle.toLowerCase();
      const isFreguesia = catLower.includes("freguesia") || catLower.includes("união de") || catLower.includes("junta") || 
                          titleLower.includes("freguesia");
      if (isFreguesia) continue;

      const id = Buffer.from(cleanLink).toString('hex');
      const image = extractImage(cleanDesc);
      const plain = stripHtml(cleanDesc);
      
      const isFeatured = titleLower.includes("fna") || titleLower.includes("festival") || titleLower.includes("feira") || titleLower.includes("festas");

      items.push({
        id,
        title: cleanTitle,
        link: cleanLink,
        date: pubDate,
        category: cleanCat,
        excerpt: plain.slice(0, 150) + (plain.length > 150 ? "..." : ""),
        description: plain,
        image,
        isFeatured
      });
    }

    if (items.length === 0) {
      return NextResponse.json({ success: true, items: FALLBACK_EVENTS });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Erro na API de eventos da Camara, a usar fallback:", error.message);
    return NextResponse.json({ success: true, items: FALLBACK_EVENTS });
  }
}
