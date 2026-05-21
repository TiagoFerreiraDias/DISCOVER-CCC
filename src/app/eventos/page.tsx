"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from "@/context/LanguageContext";

interface EventItem {
  id: string;
  title: string;
  link: string;
  date: string | null;
  category: string;
  excerpt: string;
  description: string;
  image?: string;
  isFeatured: boolean;
}

import Link from 'next/link';

function EventCard({ event, language }: { event: EventItem, language: string }) {
  const dateObj = event.date ? new Date(event.date) : null;
  
  // Formatação da data estilo "Premium"
  const day = dateObj ? dateObj.getDate() : "--";
  const month = dateObj ? dateObj.toLocaleDateString(language === 'PT' ? 'pt-PT' : 'en-US', { month: 'short' }).toUpperCase() : "---";
  
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col h-full">
      {/* Imagem com Badge de Categoria */}
      <Link href={`/eventos/${event.id}`} className="relative h-48 overflow-hidden block">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
        )}
        
        {/* Data Badge Floating */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl p-2 min-w-[50px] text-center shadow-lg border border-white/50">
          <span className="block text-xl font-black text-primary-600 leading-none">{day}</span>
          <span className="block text-[10px] font-bold text-slate-500 mt-0.5">{month}</span>
        </div>

        {/* Featured Badge */}
        {event.isFeatured && (
          <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
            Destaque
          </div>
        )}

        <div className="absolute bottom-4 left-4">
          <span className="bg-primary-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
            {event.category}
          </span>
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/eventos/${event.id}`}>
          <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3.5rem]">
            {event.title}
          </h3>
        </Link>
        
        <p className="text-slate-500 text-sm mt-3 line-clamp-3 flex-grow">
          {event.excerpt}
        </p>

        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <Link 
            href={`/eventos/${event.id}`}
            className="text-primary-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Saber mais
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EventosPage() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Data Crescente");
  const [isScrolled, setIsScrolled] = useState(false);

  const categories = ["Todos", "Destaques", "Música", "Teatro", "Exposições", "Feiras"];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
        }
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filtros e Ordenação
  const filteredEvents = useMemo(() => {
    let result = items.filter(ev => {
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           ev.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "Todos" || 
                             (selectedCategory === "Destaques" && ev.isFeatured) ||
                             ev.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                             ev.title.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    // Aplicar Ordenação
    result = result.sort((a, b) => {
      if (sortBy === "Data Crescente") {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "Data Decrescente") {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "A-Z") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [items, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Filter Bar - Style Coherent with Explorar */}
      <div className={`bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm transition-all duration-300 ${isScrolled ? 'pt-[76px] pb-2' : 'pt-24 pb-4'}`}>
        <div className={`max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300`}>
          
          {/* Categorias */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Search e Ordenação */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Procurar evento..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all bg-slate-50"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-primary-500 cursor-pointer transition-all"
            >
              <option value="Data Crescente">Data Crescente</option>
              <option value="Data Decrescente">Data Decrescente</option>
              <option value="A-Z">A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex-grow">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            Eventos
          </h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl">
            Descobre o que está a acontecer em Santarém. Dos grandes festivais às exposições mais íntimas.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-6 font-bold text-lg animate-pulse">A sincronizar com a agenda da Câmara...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} language={language} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border-2 border-slate-100 border-dashed p-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Sem eventos encontrados</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Não encontramos eventos nesta categoria para os próximos dias. Tenta mudar o filtro!
            </p>
            <button 
              onClick={() => {setSelectedCategory("Todos"); setSearchQuery("");}}
              className="mt-8 px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
            >
              Ver Tudo
            </button>
          </div>
        )}

        {/* Removed Info Footer */}
      </div>
    </div>
  );
}
