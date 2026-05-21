import { NextResponse } from "next/server";
import https from 'https';

export const dynamic = "force-dynamic";

const AGENDA_URL = "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos?format=feed&type=rss";

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
    if (!text || text.length < 100) return NextResponse.json({ success: true, items: [] });

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
        category: cleanCat, // Vamos usar a categoria como Localização
        excerpt: plain.slice(0, 150) + (plain.length > 150 ? "..." : ""),
        description: plain,
        image,
        isFeatured
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, items: [] }, { status: 500 });
  }
}
