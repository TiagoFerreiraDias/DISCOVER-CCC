import { NextResponse } from "next/server";
import https from 'https';
import * as cheerio from 'cheerio';

export const dynamic = "force-dynamic";

const AGENDA_URL = "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos?format=feed&type=rss";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ success: false, error: "ID em falta" });

  try {
    const link = Buffer.from(id, 'hex').toString('utf-8');

    // 1. RSS: Garantir Título, Data e Imagem de forma segura
    const rssText = await fetchWithHttps(AGENDA_URL);
    // Para RSS vamos manter o Regex porque é XML padrão simples
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let eventDate = null;
    let eventCategory = "Evento";
    let eventTitle = "Evento";
    let eventImage = undefined;

    while ((match = itemRegex.exec(rssText)) !== null) {
      const content = match[1];
      const itemLink = content.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
      
      if (itemLink === link) {
        const title = content.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
        const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "";
        const category = content.match(/<category>([\s\S]*?)<\/category>/i)?.[1] || "";
        
        eventTitle = title.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
        eventDate = pubDate;
        eventCategory = category.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
        
        const description = content.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
        const cleanDesc = description.replace(/<!\[CDATA\[/gi, "").replace(/\]\]>/g, "").trim();
        const m = cleanDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m && m[1]) {
           const src = m[1];
           eventImage = src.startsWith('http') ? src : `https://www.cm-santarem.pt${src.startsWith('/') ? '' : '/'}${src}`;
        }
        break;
      }
    }

    // 2. SCRAPER PROFISSIONAL: Ir à página do evento raspar a Localização precisa e a Descrição longa
    const html = await fetchWithHttps(link);
    const $ = cheerio.load(html);

    if (!eventImage) {
       eventImage = $('meta[property="og:image"]').attr('content');
    }
    
    // A. Extrair a Localização Exata
    let eventLocation = "";
    
    // Tenta encontrar a caixa de localização pela class icon-map-marker do Joomla
    $('.icon-map-marker').each((i, el) => {
      const parentText = $(el).parent().text().trim();
      if (parentText) eventLocation = parentText;
    });

    // Se falhar, procura por texto "Local: ..." no corpo da página
    if (!eventLocation) {
      const bodyText = $('body').text();
      const localMatch = bodyText.match(/Local:\s*(.+?)(?:\n|\r|$)/i);
      if (localMatch && localMatch[1]) {
        eventLocation = localMatch[1].trim();
      }
    }

    // Limpar HTML Entities como &nbsp; ou \u00a0 e fallback para categoria se fizer sentido
    if (eventLocation) {
      eventLocation = eventLocation.replace(/\u00a0/g, ' ').replace(/&nbsp;/g, ' ').trim();
    } else if (eventCategory && !eventCategory.toLowerCase().includes("evento") && !eventCategory.toLowerCase().includes("música") && !eventCategory.toLowerCase().includes("agenda")) {
      eventLocation = eventCategory;
    } else {
      eventLocation = "Santarém"; // Fallback final seguro
    }
    
    // B. Extrair a Descrição sem o lixo
    let description = "";
    const $itemPage = $('.item-page');
    
    if ($itemPage.length > 0) {
      // Remover todo o lixo conhecido do Joomla (botões, menus, info header) ANTES de ler o texto
      $itemPage.find('.page-header, .actions, .article-info, .modified, script, style, iframe, object').remove();
      
      // Capturar o HTML limpo
      let cleanHtml = $itemPage.html() || "";
      
      // Usar o cheerio novamente num fragmento novo para limpar atributos de estilo indesejados
      const $desc = cheerio.load(cleanHtml, null, false);
      $desc('*').removeAttr('class').removeAttr('style').removeAttr('id'); // Remove estilos inline
      
      // Remover parágrafos e divs vazios
      $desc('p, div').each((i, el) => {
        if (!$desc(el).text().trim() && $desc(el).children('img, br').length === 0) {
          $desc(el).remove();
        }
      });
      
      description = $desc.html() || "";
    } else {
      // Plano C: Apanhar só parágrafos no artigo
      const paragraphs: string[] = [];
      $('article p, main p').each((i, el) => {
        const text = $(el).text().trim();
        if(text) paragraphs.push(`<p>${text}</p>`);
      });
      description = paragraphs.join('');
    }
    
    if (!description || description.trim() === "") {
        description = "<p>Sem descrição detalhada disponível.</p>";
    }

    return NextResponse.json({ 
      success: true, 
      event: {
        title: eventTitle,
        description,
        image: eventImage,
        category: eventCategory,
        date: eventDate,
        location: eventLocation
      } 
    });

  } catch (error: any) {
    console.error("Erro Scraper:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
