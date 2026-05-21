import { NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export async function GET(request: Request) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'Missing Google Maps API Key' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  try {
    let queriesToRun: string[] = [];

    if (!q && !category) {
      // Estado Inicial / Destaques (Quando o utilizador clica na barra sem escrever nada)
      queriesToRun = [
        "Principais Monumentos Santarém Portugal",
        "Melhores Restaurantes Santarém Portugal",
        "Melhores Alojamentos Santarém Portugal"
      ];
    } else if (q) {
      // User typed something
      queriesToRun = [category ? `${q} ${category} Santarém Portugal` : `${q} Santarém Portugal`];
    } else {
      // User just clicked a category tab
      const catLower = category.toLowerCase();
      if (catLower.includes('cultura') || catLower.includes('culture')) {
        queriesToRun = ["Monumentos Santarém Portugal", "Museus Santarém Portugal", "Igrejas históricas Santarém Portugal"];
      } else if (catLower.includes('atividades') || catLower.includes('activities')) {
        queriesToRun = ["Cinemas Santarém Portugal", "Teatros Santarém Portugal", "Piscinas Complexo Aquático Santarém Portugal", "Parques Santarém Portugal"];
      } else if (catLower.includes('restaurante') || catLower.includes('restaurant')) {
        queriesToRun = ["Restaurantes tradicionais Santarém Portugal", "Bares Santarém Portugal"];
      } else if (catLower.includes('alojamento') || catLower.includes('accommodation')) {
        queriesToRun = ["Hotéis Santarém Portugal", "Alojamento Local Santarém Portugal"];
      } else {
        queriesToRun = ["Atrações Turísticas Santarém Portugal", "Locais Históricos Santarém Portugal"];
      }
    }

    // Run all queries in parallel
    const allResultsRaw = await Promise.all(
      queriesToRun.map(async (queryStr) => {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&language=pt-PT&key=${GOOGLE_API_KEY}`;
        const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
        const data = await searchRes.json();
        return data.status === 'OK' ? data.results : [];
      })
    );

    // Flatten results and remove duplicates (by place_name instead of just ID to prevent sub-places from appearing)
    let combinedResults: any[] = [];
    const seenNames = new Set();
    
    // We intertwine the results (1 from first query, 1 from second, etc) to ensure a good mix
    const maxLength = Math.max(...allResultsRaw.map(r => r.length));
    for (let i = 0; i < maxLength; i++) {
      for (const resultSet of allResultsRaw) {
        if (resultSet[i]) {
          const place = resultSet[i];
          const normalizedName = place.name.toLowerCase().trim();
          if (!seenNames.has(normalizedName)) {
            seenNames.add(normalizedName);
            combinedResults.push(place);
          }
        }
      }
    }

    // Filtragem agressiva anti-lixo e anti-estacionamentos
    const safeResults = combinedResults.filter((place: any) => {
      const name = place.name.toLowerCase();
      
      // Filtro Adultos
      if (name.includes('sex') || name.includes('erot') || name.includes('adult')) return false;
      
      // Filtro Parques de Estacionamento (Google confunde com "Parques")
      if (name.includes('estacionamento') || name.includes('parking') || name.includes('parkel') || name.includes('empa')) return false;
      if (place.types && place.types.includes('parking')) return false;

      // Filtro de supermercados ou similares se necessário (opcional)
      if (name.includes('pingo doce') || name.includes('continente') || name.includes('lidl') || name.includes('aldi') || name.includes('intermarché')) return false;

      // Filtro de Duplicados Manuais da mesma Entidade (As 3 "versões" das piscinas)
      if (name === 'piscinas de santarém' || name.includes('viver santarém')) return false;

      return true;
    });

    // Map to the internal structure
    const mappedResults = safeResults.slice(0, 15).map((place: any) => {
      
      // Determinar a imagem de fallback com base no tipo de local ou categoria atual
      let fallbackImage = "/monument.png"; // Cultura / Monumentos por defeito
      const typesStr = place.types ? place.types.join(' ') : "";
      
      if (category.toLowerCase().includes('restaurante') || typesStr.includes('restaurant') || typesStr.includes('food') || typesStr.includes('bar')) {
        fallbackImage = "/food.png";
      } else if (category.toLowerCase().includes('alojamento') || typesStr.includes('lodging') || typesStr.includes('hotel')) {
        fallbackImage = "/river.png";
      } else if (category.toLowerCase().includes('atividades') || typesStr.includes('park') || typesStr.includes('amusement')) {
        fallbackImage = "/nature.png";
      }

      // Obter imagem original ou o nosso fallback temático
      const photoUrl = place.photos && place.photos.length > 0
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
        : fallbackImage;
        
      let ratingStr = "N/A";
      if (place.rating) {
        ratingStr = String(place.rating).replace('.', ',');
      }

      // Preço tentativo via price_level
      let priceStr = "Ver Local";
      if (place.price_level !== undefined) {
        priceStr = "€".repeat(place.price_level) || "Barato";
      }

      return {
        id: place.place_id,
        title: place.name,
        image: photoUrl,
        rating: ratingStr,
        reviews: place.user_ratings_total ? String(place.user_ratings_total) : "0",
        tag: place.types ? place.types[0].replace(/_/g, ' ') : "Informação",
        price: priceStr,
      };
    });

    return NextResponse.json({ results: mappedResults });

  } catch (error) {
    console.error("Erro na busca de Places:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
