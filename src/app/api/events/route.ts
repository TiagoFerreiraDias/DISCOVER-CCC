import { NextResponse } from "next/server";
import https from 'https';

export const dynamic = "force-dynamic";

const AGENDA_URL = "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos?format=feed&type=rss";

const FALLBACK_EVENTS = [
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313935342d63696e656d612d6c2d7061692d6e6f73736f2d6f732d756c74696d6f732d646961732d64652d73616c617a61722d64652d6a6f73652d66696c6970652d636f737461",
    "title": "Cinema l Pai Nosso – Os últimos dias de Salazar, de José Filipe Costa",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1954-cinema-l-pai-nosso-os-ultimos-dias-de-salazar-de-jose-filipe-costa",
    "date": "Wed, 03 Jun 2026 21:30:00 +0100",
    "category": "Teatro Sá da Bandeira",
    "excerpt": "2026-06-03 Cinema | Qua, 3 jun | 21h30 | Teatro Sá da Bandeira Bilhetes: Bilhetes PAI NOSSO - OS ÚLTIMOS DIAS DE SALAZAR - Teatro Sá da Bandeira &nbsp...",
    "description": "2026-06-03 Cinema | Qua, 3 jun | 21h30 | Teatro Sá da Bandeira Bilhetes: Bilhetes PAI NOSSO - OS ÚLTIMOS DIAS DE SALAZAR - Teatro Sá da Bandeira &nbsp; Preço público geral » 5€ | sócios Cineclube » 2,5€ | bilhete jovem até 30 anos » 1€ | bilhete jovem até 30 anos sócio cineclube » entrada gratuita ?? ??????????? ????? ??? ?? ?? ???ç? à? ????? Título original: PAI NOSSO - OS ÚLTIMOS DIAS DE SALAZAR De: José Filipe Costa Ficção, Portugal, 2025, 112´, M/12 &nbsp; Sinopse: Portugal, 1968. Salazar, o ditador fascista que no mundo mais tempo esteve no poder, cai de uma cadeira e sofre um AVC. Quando volta ao palacete de São Bento para convalescer, já não é Presidente do Conselho. Mas ninguém lhe conta a verdade: nem a fiel governanta Maria de Jesus, nem as criadas Aparecida, Socorro e Teresinha, nem o seu médico pessoal. Durante dois anos ele vive uma ilusão minuciosamente construída para acreditar que ainda é Presidente, até morrer in 1970. Uma das farsas mais absurdas da História, que muita gente ainda hoje ignora. &nbsp; A programação do Teatro Sá da Bandeira tem o apoio da República Portuguesa – Cultura, Juventude e Desporto I DGARTES – Direção-Geral das Artes e da Rede de Teatros e Cineteatros Portugueses &nbsp; Teatro Sá da Bandeira Horário de Abertura ao público: 3ª a 6ª feira – 10:00 às 12:00 / 14:00 às 16:00 Nos espetáculos a realizar em horário de encerramento, a bilheteira abre 1 hora antes Encerrado ao Sábado, Domingo, Segunda-feira e Feriados Fora do horário de abertura ao público, a venda e reservas de bilhetes é possível através da plataforma online – BOL e nas lojas Worten e FNAC. Contactos: T. 243 309 460 | teatrosabandeira [AT] cm-santarem [DOT] pt",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_cinema-pai-nosso-redim.jpg",
    "isFeatured": false
  },
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313935372d666e612d323032362d6c2d66656972612d6e6163696f6e616c2d64652d6167726963756c747572612d66656972612d646f2d7269626174656a6f",
    "title": "FNA 2026 l Feira Nacional de Agricultura - Feira do Ribatejo",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1957-fna-2026-l-feira-nacional-de-agricultura-feira-do-ribatejo",
    "date": "Sat, 06 Jun 2026 09:00:00 +0100",
    "category": "Eventos",
    "excerpt": "2026-06-06 De 6 a 14 de junho, Santarém vai viver intensamente a FNA 26 – Feira Nacional de Agricultura/Feira do Ribatejo, um dos maiores encontros na...",
    "description": "2026-06-06 De 6 a 14 de junho, Santarém vai viver intensamente a FNA 26 – Feira Nacional de Agricultura/Feira do Ribatejo, um dos maiores encontros nacionais dedicados ao mundo agrícola, às tradições e à inovação. Durante nove dias, o CNEMA transforma-se num espaço de partilha, negócios, gastronomia, tecnologia, cultura e animação, reunindo profissionais do setor, famílias e visitantes de todo o país. &nbsp;Entre a força das tradições ribatejanas e a visão de futuro da agricultura portuguesa, a FNA 26 promete experiências únicas, sabores autênticos e momentos inesquecíveis. &nbsp; A Feira Nacional de Agricultura /Feira do Ribatejo (FNA26), o maior evento do setor em Portugal decorre de 6 a 14 de Junho e nesta edição dá especial destaque aos Pequenos Frutos. O sector dos pequenos frutos – mirtilos, morangos, framboesas, amoras – tem demonstrado um notável dinamismo, e um crescente interesse por parte dos consumidores fruto seu elevado valor nutricional, e uma importância crescente na agricultura portuguesa. A FNA26 constitui um espaço privilegiado de inovação, reunindo maquinaria, equipamentos, tecnologia agrícola, fatores de produção e serviços. É igualmente um ponto de encontro entre produtores e consumidores, que ali encontram uma vasta oferta de produtos de elevada qualidade. Além da vertente expositiva e comercial, a FNA26 é também o palco de debate sobre os temas mais relevantes do setor agrícola, reunindo especialistas, investigadores e decisores políticos, contribuindo para o desenvolvimento e modernização do setor. A FNA26 representa assim, a plataforma ideal para impulsionar negócios e reforçar a visibilidade das marcas no panorama agrícola nacional. DIA DOS MUNICÍPIOS 6 JUNHO Dia dos Municípios do Cartaxo, Abrantes, Vila Nova da Barquinha e Alcobaça 7 JUNHO Dia dos Municípios de Almeirim, Sardoal, Torres Novas e Alenquer 8 JUNHO Dia dos Municípios de Salvaterra de Magos, Tomar e Arruda dos Vinhos 9 JUNHO Dia dos Municípios de Benavente, Ferreira do Zêzere e Bombarral 10 JUNHO Dia dos Municípios de Coruche, Ourém, Caldas da Rainha e Cadaval 11JUNHO Dia dos Municípios de Azambuja, Alcanena, Nazaré e Lourinhã 12 JUNHO Dia dos Municípios de Rio Maior, Santarém, Mação e Óbidos 13 JUNHO Dia dos Municípios de Alpiarça, Chamusca, Entroncamento e Peniche 14 JUNHO Dia dos Municípios da Golegã, Constância, Sobral de Monte Agraço e Torres Vedras CONCERTOS FNA 26 Revenge of the 90s&nbsp;– 6 junho Deejay Telio - 9 junho Plutonio e DJ Dadda&nbsp;– 12 junho David Antunes e Gabriel o Pensador&nbsp;– 13 junho Veja aqui como foi a edição de 2025:&nbsp; https://www.youtube.com/watch?v=95IXwke6O1o MANUAL DO EXPOSITOR https://www.cnema.pt/wp-content/uploads/2025/11/Manual-expositor_FNA26.pdf Nota:&nbsp;Não é permitida a entrada de animais que não estejam em exposição ou a concurso REGULAMENTOS Regulamento do CNEMA – Consulte Aqui:&nbsp; https://www.cnema.pt/wp-content/uploads/2023/01/REGULAMENTO-CNEMA.pdf Regulamento CARPORT (Parque de Estacionamento) CNEMA – Consulte Aqui:&nbsp; https://www.cnema.pt/wp-content/uploads/2023/01/REGULAMENTO-CARPORT-CNEMA.pdf ENTRADAS Bilhete Feira:&nbsp;8,50 €&nbsp; (Permite uma única entrada) Cadernetas de 10 Bilhetes:&nbsp;58,00 € (Cada bilhete permite uma única entrada. À venda até 5 junho) Livre-Trânsito:&nbsp;26,00 € (O Livre – Trânsito permite visitar a feira a qualquer hora e várias vezes por dia) Parque de Estacionamento Ar Livre:&nbsp;Gratuito Parque de Estacionamento Coberto:&nbsp;5,00 € / dia Dia 8 de junho:&nbsp;Entrada Gratuita Todos os Dias:&nbsp;Entrada gratuita para crianças até aos 11 anos (inclusive) Bilheteira Online:&nbsp; https://ticket.cnema.pt/pos/event/list HORÁRIO 6 a 13 junho NAVE A:&nbsp;10h00 às 22h30 NAVE B:&nbsp;10h00 às 22h30 NAVE C:&nbsp;10h00 às 24h00 ZONA EXTERIOR/EQUIPAMENTOS E MAQUINARIA AGRÍCOLA:&nbsp;10h00 às 21h00 ATIVIDADES LÚDICAS:&nbsp;10h00 às 03h00 A entrada no recinto é efetuada até às 00h30 Os horários podem ser alterados por motivos imprevistos 14 junho Todo o recinto:&nbsp;10h00 às 20h00 A entrada no recinto é efetuada até às 19h00 Os horários podem ser alterados por motivos imprevistos Dia Entrada Livre:&nbsp;8 junho Nota:&nbsp;Os horários poderão ser alterados por motivos imprevistos",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_fna26.jpg",
    "isFeatured": true
  },
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313935392d7265756e69616f2d646f2d65786563757469766f",
    "title": "Reunião do Executivo",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1959-reuniao-do-executivo",
    "date": "Fri, 12 Jun 2026 15:00:00 +0100",
    "category": "Reuniões do Executivo",
    "excerpt": "2026-06-12 No que diz respeito ao Período de Intervenção do Público e nos termos do disposto no nº 2 do artº 10º do Regimento da Câmara Municipal de S...",
    "description": "2026-06-12 No que diz respeito ao Período de Intervenção do Público e nos termos do disposto no nº 2 do artº 10º do Regimento da Câmara Municipal de Santarém, “Os cidadãos interessados em intervir para solicitar esclarecimentos terão de fazer, antecipadamente, a sua inscrição referindo nome, morada e assunto a tratar”. A mencionada inscrição deverá, preferencialmente, ser feita para o e-mail:&nbsp;saoa [AT] cm-santarem [DOT] pt&nbsp;saoa [AT] cm-santarem [DOT] ptsaoa [AT] cm-santarem [DOT] pt",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_sala-de-reunioes-de-camara-redim.png",
    "isFeatured": false
  },
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313936332d6174656e64696d656e746f2d6a7572697374612d64612d6465636f",
    "title": "Atendimento Jurista da DECO",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1963-atendimento-jurista-da-deco",
    "date": "Mon, 15 Jun 2026 09:30:00 +0100",
    "category": "Atendimento Deco",
    "excerpt": "2026-06-15 O atendimento do jurista da DECO realiza-se no dia 15 de junho, das 09h30 às 12h30, no CIAC - Centro de Informação Autárquico ao Consumidor...",
    "description": "2026-06-15 O atendimento do jurista da DECO realiza-se no dia 15 de junho, das 09h30 às 12h30, no CIAC - Centro de Informação Autárquico ao Consumidor (Edifício da antiga E-Redes) – Avenida Grupo de Forcados Amadores de Santarém, 2000-181 Santarém, mediante marcação prévia, através dos números de telefone 243 304 400 ou 243 329 950 – DECO ou do e-mail: ciac [AT] cm-santarem [DOT] pt . Este Serviço conta também com o Balcão de Habitação e Energia. Este serviço presta informação ao Munícipe sobre direitos e deveres na energia, enquanto Serviço Público Essencial; Apoios Sociais no Combate à Pobreza Energética; Programas do Fundo Ambiental para uma Transição Energética; Informação ao Munícipe sobre direitos na habitação (mediação imobiliária, compra, arrendamento e condomínio); Acesso à habitação (crédito habitação, crédito para obras, seguros associados); Apoios sociais no acesso à habitação – acompanhamento a apoios sociais no acesso à habitação; Acompanhamento nas candidaturas a programas a nível local e nacional; Apoios na reabilitação da habitação – Acompanhamento na candidatura a programas a nível local e nacional. O atendimento é gratuito, ao Abrigo do Protocolo CMS/DECO, somente para Munícipes do concelho de Santarém, que podem esclarecer as mais variadas dúvidas sobre os direitos do consumidor. Promover a informação e defesa dos consumidores é o objetivo destas sessões de atendimento ao consumidor que a DECO – Associação Portuguesa para a Defesa do Consumidor realiza todos os meses, em Santarém.",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_atendimento-deco-santarem-1-e-15-de-junho-2026-redim.png",
    "isFeatured": false
  },
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313935352d63696e656d612d6c2d6f2d626f6c6f2d646f2d707265736964656e74652d64652d686173616e2d68616469",
    "title": "Cinema l O Bolo do Presidente, de Hasan Hadi",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1955-cinema-l-o-bolo-do-presidente-de-hasan-hadi",
    "date": "Wed, 17 Jun 2026 21:30:00 +0100",
    "category": "Teatro Sá da Bandeira",
    "excerpt": "2026-06-17 Cinema | Qua, 17 jun | 21h30 | Teatro Sá da Bandeira Bilhetes:&nbsp; Bilhetes O BOLO DO PRESIDENTE - Teatro Sá da Bandeira &nbsp; &nbsp; Pr...",
    "description": "2026-06-17 Cinema | Qua, 17 jun | 21h30 | Teatro Sá da Bandeira Bilhetes:&nbsp; Bilhetes O BOLO DO PRESIDENTE - Teatro Sá da Bandeira &nbsp; &nbsp; Preço público geral » 5€ | sócios Cineclube » 2,5€ | bilhete jovem até 30 anos » 1€ | bilhete jovem até 30 anos sócio cineclube » entrada gratuita ?? ??????????? ????? ??? ?? ?? ???ç? à? ????? Título original: THE PRESIDENT CACKE De: Hasan Hadi Drama, EUA, Qatar, Iraque, 2026, 105´, M/12 Sinopse: Situado no Iraque, em 1991, sob o regime de Saddam Hussein e em pleno período de sanções norte-americanas, o filme acompanha Lamia, uma menina de nove anos responsável por preparar um bolo para celebrar o 54.º aniversário do Presidente na sua escola. Num contexto de pobreza, vigilância e medo de represálias, a tarefa — imposta através de um sorteio e reforçada pelas autoridades — transforma-se rapidamente em algo de arriscado mas que a pequena Lamia tentará cumprir a todo o custo. Neste filme, a tarefa específica de fazer um bolo para o Presidente é algo ficcional e serve como metáfora para mostrar o absurdo e a opressão do regime. Com realização e argumento de Hasan Hadi, \"O Bolo do Presidente\" foi distinguido no Festival de Cinema de Cannes com o Prémio Câmara de Ouro e o Prémio do Público da Quinzena dos Realizadores. &nbsp; A programação do Teatro Sá da Bandeira tem o apoio da República Portuguesa – Cultura, Juventude e Desporto I DGARTES – Direção-Geral das Artes e da Rede de Teatros e Cineteatros Portugueses &nbsp; Teatro Sá da Bandeira Horário de Abertura ao público: 3ª a 6ª feira – 10:00 às 12:00 / 14:00 às 16:00 Nos espetáculos a realizar em horário de encerramento, a bilheteira abre 1 hora antes Encerrado ao Sábado, Domingo, Segunda-feira e Feriados Fora do horário de abertura ao público, a venda e reservas de bilhetes é possível através da plataforma online – BOL e nas lojas Worten e FNAC. Contactos: T. 243 309 460 | teatrosabandeira [AT] cm-santarem [DOT] pt",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_o-bolo-presidente-redim.jpg",
    "isFeatured": false
  },
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313936302d7265756e69616f2d646f2d65786563757469766f",
    "title": "Reunião do Executivo",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1960-reuniao-do-executivo",
    "date": "Mon, 22 Jun 2026 15:00:00 +0100",
    "category": "Reuniões do Executivo",
    "excerpt": "2026-06-22 No que diz respeito ao Período de Intervenção do Público e nos termos do disposto no nº 2 do artº 10º do Regimento da Câmara Municipal de S...",
    "description": "2026-06-22 No que diz respeito ao Período de Intervenção do Público e nos termos do disposto no nº 2 do artº 10º do Regimento da Câmara Municipal de Santarém, “Os cidadãos interessados em intervir para solicitar esclarecimentos terão de fazer, antecipadamente, a sua inscrição referindo nome, morada e assunto a tratar”. A mencionada inscrição deverá, preferencialmente, ser feita para o e-mail:&nbsp;saoa [AT] cm-santarem [DOT] pt&nbsp;saoa [AT] cm-santarem [DOT] ptsaoa [AT] cm-santarem [DOT] pt",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_sala-de-reunioes-de-camara-redim.png",
    "isFeatured": false
  },
  {
    "id": "68747470733a2f2f7777772e636d2d73616e746172656d2e70742f646573636f627269722d73616e746172656d2f6167656e64612d64652d6576656e746f732f313935362d63696e656d612d6c2d726f6d617269612d64652d6361726c612d73696d6f6e",
    "title": "Cinema l Romaria, de Carla Simón",
    "link": "https://www.cm-santarem.pt/descobrir-santarem/agenda-de-eventos/1956-cinema-l-romaria-de-carla-simon",
    "date": "Wed, 24 Jun 2026 21:30:00 +0100",
    "category": "Teatro Sá da Bandeira",
    "excerpt": "2026-06-24 Cinema | Qua, 24 jun | 21h30 | Teatro Sá da Bandeira Bilhetes:&nbsp; Bilhetes ROMARIA - Teatro Sá da Bandeira &nbsp; Preço público geral » ...",
    "description": "2026-06-24 Cinema | Qua, 24 jun | 21h30 | Teatro Sá da Bandeira Bilhetes:&nbsp; Bilhetes ROMARIA - Teatro Sá da Bandeira &nbsp; Preço público geral » 5€ | sócios Cineclube » 2,5€ | bilhete jovem até 30 anos » 1€ | bilhete jovem até 30 anos sócio cineclube » entrada gratuita ?? ??????????? ????? ??? ?? ?? ???ç? à? ????? Título original: ROMERÍA De: Carla Simón Drama, Espanha, 2025, 155´, M/12 Sinopse: Marina, de 18 anos, órfã desde pequena, tem de viajar até à costa atlântica de Espanha para conseguir uma assinatura dos avós paternos, que nunca conheceu, para um pedido de uma bolsa de estudo. Lá, conhecerá uma multitude de novos tios, tias e primos, sem saber se será acolhida ou se encontrará resistência. Despertando emoções há muito enterradas, reacendendo a ternura e destapando feridas silenciosas ligadas ao passado, Marina reconstrói as memórias fragmentadas – e muitas vezes contraditórias – dos pais de quem mal se lembra. &nbsp; A programação do Teatro Sá da Bandeira tem o apoio da República Portuguesa – Cultura, Juventude e Desporto I DGARTES – Direção-Geral das Artes e da Rede de Teatros e Cineteatros Portugueses &nbsp; Teatro Sá da Bandeira Horário de Abertura ao público: 3ª a 6ª feira – 10:00 às 12:00 / 14:00 às 16:00 Nos espetáculos a realizar em horário de encerramento, a bilheteira abre 1 hora antes Encerrado ao Sábado, Domingo, Segunda-feira e Feriados Fora do horário de abertura ao público, a venda e reservas de bilhetes é possível através da plataforma online – BOL e nas lojas Worten e FNAC. Contactos: T. 243 309 460 | teatrosabandeira [AT] cm-santarem [DOT] pt",
    "image": "https://www.cm-santarem.pt/images/icagenda/thumbs/themes/ic_medium_w300h300q100_cinema-romaria.jpg",
    "isFeatured": false
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
