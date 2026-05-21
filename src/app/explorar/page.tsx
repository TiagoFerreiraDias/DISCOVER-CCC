"use client";

import React, { useState, useEffect, Suspense } from 'react';
import PlaceCard from "@/components/PlaceCard";
import { useSearchParams } from 'next/navigation';

function ExplorarContent() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('categoria') || "Todos";
  
  const categories = ["Todos", "Cultura", "Atividades", "Restaurantes", "Alojamento"];
  
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isScrolled, setIsScrolled] = useState(false);

  const [sortBy, setSortBy] = useState("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Se o URL mudar (clique na navbar ou home page), atualizamos a categoria
  useEffect(() => {
    const urlCategory = searchParams.get('categoria');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  // Listener de Scroll para encolher a barra
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Buscar Locais
  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const queryParam = encodeURIComponent(searchQuery.trim());
        const categoryParam = encodeURIComponent(selectedCategory === "Todos" ? '' : selectedCategory);
        
        const res = await fetch(`/api/places/search?q=${queryParam}&category=${categoryParam}`);
        const data = await res.json();
        
        if (data.results) {
          setPlaces(data.results);
        } else {
          setPlaces([]);
        }
      } catch(err) {
        console.error("Erro a fecthar places no Explorar", err);
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPlaces();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleMapClick = () => {
    const query = searchQuery ? searchQuery : selectedCategory === "Todos" ? "Principais Locais" : selectedCategory;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}+Santarém+Portugal`;
    window.open(url, '_blank');
  };

  // Aplicar a ordenação aos resultados
  const displayedPlaces = [...places].sort((a, b) => {
    if (sortBy === 'rating') {
      const ratingA = parseFloat(a.rating.replace(',', '.')) || 0;
      const ratingB = parseFloat(b.rating.replace(',', '.')) || 0;
      return ratingB - ratingA;
    }
    if (sortBy === 'reviews') {
      const revA = parseInt(a.reviews.replace(/\s/g, '')) || 0;
      const revB = parseInt(b.reviews.replace(/\s/g, '')) || 0;
      return revB - revA;
    }
    return 0; // relevance
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Filter Bar */}
      <div className={`bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm animate-in fade-in slide-in-from-top-4 transition-all duration-300 ${isScrolled ? 'pt-[76px] pb-2' : 'pt-24 pb-4'}`}>
        <div className={`max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center transition-all duration-300 ${isScrolled ? 'gap-2' : 'gap-4'}`}>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setSelectedCategory(cat); setSearchQuery(""); setSortBy("relevance"); }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 relative">
            {/* Dropdown de Ordenação Compacto */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`p-2.5 border-2 rounded-xl transition-all h-[44px] flex items-center justify-center ${sortBy !== 'relevance' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                title="Ordenar resultados"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => {setSortBy('relevance'); setIsSortOpen(false);}} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${sortBy === 'relevance' ? 'font-bold text-primary-600 bg-primary-50/50' : 'text-slate-700'}`}>Relevância</button>
                    <button onClick={() => {setSortBy('rating'); setIsSortOpen(false);}} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-t border-slate-100 ${sortBy === 'rating' ? 'font-bold text-primary-600 bg-primary-50/50' : 'text-slate-700'}`}>Melhor Classificação</button>
                    <button onClick={() => {setSortBy('reviews'); setIsSortOpen(false);}} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-t border-slate-100 ${sortBy === 'reviews' ? 'font-bold text-primary-600 bg-primary-50/50' : 'text-slate-700'}`}>Mais Avaliações</button>
                  </div>
                </>
              )}
            </div>

            {/* Barra de Pesquisa Inline */}
            <div className="relative flex-grow md:w-64">
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all bg-slate-50"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            <button 
              onClick={handleMapClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border-2 border-slate-900 rounded-xl text-sm font-bold text-white hover:bg-slate-800 w-full md:w-auto justify-center transition-all shadow-md shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Ver no Mapa
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Explorar Santarém</h1>
            <p className="text-slate-500 mt-2 text-lg">
              {isLoading ? "A pesquisar locais..." : "Experiências de topo selecionadas para ti"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 mt-4 font-medium">A analisar o Google Maps...</p>
          </div>
        ) : displayedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {displayedPlaces.map((place) => (
               <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-slate-100 border-dashed">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-xl font-bold text-slate-800">Nenhum resultado encontrado</h3>
            <p className="text-slate-500 mt-2 max-w-md">Não conseguimos encontrar nada que corresponda a "{searchQuery}". Tenta pesquisar por outra coisa.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-6 px-6 py-2.5 bg-primary-100 text-primary-700 font-bold rounded-full hover:bg-primary-200 transition-all"
            >
              Limpar Pesquisa
            </button>
          </div>
        )}
        
        <div className="mt-16 mb-20 flex justify-center">
           <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
             <span className="w-8 h-px bg-slate-300"></span>
             Fim dos resultados
             <span className="w-8 h-px bg-slate-300"></span>
           </p>
        </div>
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-24">
         <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    }>
      <ExplorarContent />
    </Suspense>
  );
}
