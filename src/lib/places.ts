const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export interface PlaceDetails {
  id: string;
  name: string;
  description: string;
  images: string[];
  rating: string;
  reviews: string;
  types: string[];
  address: string;
  category: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  rawReviews?: any[];
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_API_KEY) {
    console.error("Missing Google Maps API Key");
    return null;
  }
  
  try {
    let finalPlaceId = placeId;
    
    // Se o ID vier dos nossos cartões Demo (ex: "igreja_graca_visita"), 
    // fazemos uma pesquisa automática para descobrir o ID real no Google Maps!
    if (!placeId.startsWith('ChI')) {
      const searchQuery = placeId.replace(/_/g, ' ') + ' Santarém Portugal';
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&language=pt-PT&key=${GOOGLE_API_KEY}`;
      const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
      const searchData = await searchRes.json();
      
      if (searchData.status === 'OK' && searchData.results.length > 0) {
        finalPlaceId = searchData.results[0].place_id;
      } else {
        console.error("Não foi possível mapear o nome falso para um Google Place ID real.");
        return null;
      }
    }

    // Obter detalhes profundos do local com o ID verdadeiro
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${finalPlaceId}&language=pt-PT&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url, { next: { revalidate: 86400 } });
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error("Place API Error:", data.status, data.error_message);
      return null;
    }
    
    const result = data.result;
    
    // Extrair fotos originais
    const images = [];
    if (result.photos && result.photos.length > 0) {
      for (let i = 0; i < Math.min(5, result.photos.length); i++) {
        images.push(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${result.photos[i].photo_reference}&key=${GOOGLE_API_KEY}`);
      }
    } else {
      images.push("/monument.png"); // Fallback fallback
    }

    // Criar descrição (Google > Wikipedia > Reviews)
    let description = "Informação detalhada indisponível. Em breve teremos mais detalhes sobre este local em Santarém.";
    
    if (result.editorial_summary && result.editorial_summary.overview) {
      description = result.editorial_summary.overview;
    } else {
      // Tentar a Wikipedia REST API como Fallback
      try {
        const cleanName = result.name.split('-')[0].split(',')[0].trim();
        const wikiSearchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanName + ' Santarém Portugal')}&utf8=&format=json&origin=*`;
        const wikiSearchRes = await fetch(wikiSearchUrl);
        const wikiSearchData = await wikiSearchRes.json();
        
        let foundWiki = false;
        const excludedTitles = ['Santarém (Portugal)', 'Santarém', 'Santarém (Pará)', 'Santarém (freguesia)', 'Distrito de Santarém'];

        if (wikiSearchData.query && wikiSearchData.query.search.length > 0) {
           const topTitle = wikiSearchData.query.search[0].title;
           if (!excludedTitles.includes(topTitle)) {
             const wikiSummaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`;
             const wikiSummaryRes = await fetch(wikiSummaryUrl);
             const wikiSummaryData = await wikiSummaryRes.json();
             
             if (wikiSummaryData.extract && wikiSummaryData.extract.length > 50) {
               description = wikiSummaryData.extract;
               foundWiki = true;
             }
           }
        }
        
        if (!foundWiki && result.reviews && result.reviews.length > 0) {
           // Procura a review com texto mais longo
           const textReview = [...result.reviews].sort((a: any, b: any) => (b.text?.length || 0) - (a.text?.length || 0))[0];
           if (textReview && textReview.text && textReview.text.length > 15) {
             description = `A perspetiva dos visitantes: "${textReview.text}"`;
           } else {
             description = `Um dos locais de interesse em Santarém. Explore as opiniões e fotografias para descobrir mais detalhes sobre a experiência.`;
           }
        } else if (!foundWiki) {
           description = `Um dos locais de interesse em Santarém. Explore as opiniões e fotografias para descobrir mais detalhes sobre a experiência.`;
        }
      } catch (err) {
        console.error("Erro ao procurar na Wikipedia", err);
      }
    }
    
    // Identificar a categoria principal visualmente
    let category = "Local de Interesse";
    if (result.types) {
      if (result.types.includes("tourist_attraction") || result.types.includes("church")) category = "Monumentos Históricos";
      else if (result.types.includes("restaurant") || result.types.includes("food")) category = "Gastronomia";
      else if (result.types.includes("lodging") || result.types.includes("hotel")) category = "Alojamentos";
      else if (result.types.includes("park") || result.types.includes("natural_feature")) category = "Trilhos e Natureza";
    }

    return {
      id: finalPlaceId, // Passamos o ID real de volta para a app poder salvar Favoritos com o ID idêntico 
      name: result.name,
      description: description,
      images: images,
      rating: result.rating ? String(result.rating).replace('.', ',') : "N/A",
      reviews: result.user_ratings_total ? String(result.user_ratings_total) : "0",
      types: result.types || [],
      address: result.formatted_address || "Santarém",
      category: category,
      phone: result.formatted_phone_number || undefined,
      website: result.website || undefined,
      openingHours: result.opening_hours?.weekday_text || undefined,
      rawReviews: result.reviews ? result.reviews.filter((r: any) => r.text && r.text.trim().length > 3) : undefined
    };
  } catch (error) {
    console.error("Failed to fetch place details:", error);
    return null;
  }
}
