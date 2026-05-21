"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function ItinerarioMap() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const routeId = params?.id as string;

  const [itinerary, setItinerary] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [travelMode, setTravelMode] = useState<"walking" | "driving">("walking");
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener para o Cabeçalho Dinâmico
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch itinerary data
  useEffect(() => {
    async function fetchItinerary() {
      if (!user || !routeId) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'routes', routeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setItinerary(docSnap.data());
        } else {
          console.error("Itinerário não encontrado!");
        }
      } catch (err) {
        console.error("Erro ao carregar itinerário:", err);
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchItinerary();
  }, [user, routeId]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">A carregar o teu mapa...</p>
      </div>
    );
  }

  if (!itinerary || !itinerary.places || itinerary.places.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4">🗺️</span>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Itinerário Vazio ou Não Encontrado</h1>
        <p className="text-slate-500 mb-6">Parece que esta rota não existe ou não tem locais guardados.</p>
        <Link href="/rotas" className="px-6 py-3 bg-primary-600 text-white font-bold rounded-full shadow-md hover:bg-primary-700 transition-colors">Voltar às Rotas</Link>
      </div>
    );
  }

  // --- GOOGLE MAPS EMBED URL BUILDER ---
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  let mapUrl = "";
  
  if (itinerary.places.length === 1) {
    // Apenas 1 local -> Modo "Place" (Mostra o ponto no mapa)
    mapUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=place_id:${itinerary.places[0].id}`;
  } else {
    // 2 ou mais locais -> Modo "Directions" (Desenha a rota A -> B -> C)
    const origin = `place_id:${itinerary.places[0].id}`;
    const destination = `place_id:${itinerary.places[itinerary.places.length - 1].id}`;
    
    let waypoints = "";
    if (itinerary.places.length > 2) {
      const mids = itinerary.places.slice(1, itinerary.places.length - 1);
      waypoints = `&waypoints=` + mids.map((p: any) => `place_id:${p.id}`).join('|');
    }
    
    mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_API_KEY}&origin=${origin}&destination=${destination}${waypoints}&mode=${travelMode}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Fixo Dinâmico (Collapsing Header) */}
      <div className={`bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'pt-4 pb-3 shadow-md' : 'pt-20 pb-4 shadow-sm'} px-4 md:px-8`}>
        <div className={`max-w-6xl mx-auto flex ${isScrolled ? 'flex-row items-center justify-between' : 'flex-col md:flex-row justify-between items-start md:items-center'} gap-4 transition-all`}>
          <div>
            {/* Voltar (Full e Mini) */}
            {!isScrolled ? (
              <Link href="/rotas" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary-600 mb-2 transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Voltar às Rotas
              </Link>
            ) : (
              <Link href="/rotas" className="inline-flex items-center text-slate-400 hover:text-primary-600 mr-4 transition-colors align-middle" title="Voltar às Rotas">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              </Link>
            )}
            
            <h1 className={`${isScrolled ? 'text-xl inline-block align-middle' : 'text-3xl'} font-extrabold text-slate-900 tracking-tight transition-all`}>
              {itinerary.name}
            </h1>
            
            {!isScrolled && (
              <p className="text-sm font-medium text-slate-500 mt-1">{itinerary.places.length} paragens no total</p>
            )}
          </div>
          
          {/* Travel Mode Toggle */}
          {itinerary.places.length > 1 && (
            <div className={`bg-slate-100 p-1 rounded-xl flex items-center shadow-inner border border-slate-200 ${isScrolled ? '' : 'w-full md:w-auto'}`}>
              <button 
                onClick={() => setTravelMode("walking")}
                className={`flex items-center justify-center gap-2 ${isScrolled ? 'px-3 py-2' : 'flex-1 md:flex-none px-6 py-2.5'} rounded-lg text-sm font-bold transition-all ${travelMode === 'walking' ? 'bg-white text-primary-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                title="A Pé"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"></path></svg>
                {!isScrolled && <span>A Pé</span>}
              </button>
              <button 
                onClick={() => setTravelMode("driving")}
                className={`flex items-center justify-center gap-2 ${isScrolled ? 'px-3 py-2' : 'flex-1 md:flex-none px-6 py-2.5'} rounded-lg text-sm font-bold transition-all ${travelMode === 'driving' ? 'bg-white text-primary-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                title="Carro"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>
                {!isScrolled && <span>Carro</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Painel Esquerdo: Lista de Paragens */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800 mb-2">As Tuas Paragens</h2>
          
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 flex flex-col gap-8">
            {itinerary.places.map((place: any, index: number) => (
              <div key={index} className="relative">
                {/* Marker Bullet */}
                <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-slate-50">
                  {index + 1}
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  {place.image && place.image !== "/monument.png" && (
                    <img src={place.image} alt={place.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight pr-2">{place.name}</h3>
                  </div>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                    {place.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel Direito: O Mapa Interativo do Google */}
        <div className="w-full lg:w-2/3 h-[500px] lg:h-[700px] bg-white rounded-3xl p-2 shadow-md border border-slate-200 sticky top-48">
           <iframe 
             width="100%" 
             height="100%" 
             frameBorder="0" 
             style={{ border: 0, borderRadius: "1.2rem" }}
             src={mapUrl}
             allowFullScreen
             title="Mapa Interativo do Itinerário"
           ></iframe>
        </div>

      </div>
    </div>
  );
}
