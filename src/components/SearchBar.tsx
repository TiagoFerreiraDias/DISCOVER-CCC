"use client";

import React, { useState, useRef, useEffect } from 'react';
import PlaceCard from './PlaceCard';
import { useLanguage } from '@/context/LanguageContext';

export default function SearchBar() {
  const { t } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  
  // Set default filter after language load using an effect to prevent hydration mismatch
  useEffect(() => {
    if (!selectedFilter) setSelectedFilter(t('search.all'));
  }, [t, selectedFilter]);

  const [searchQuery, setSearchQuery] = useState("");
  const [livePlaces, setLivePlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filters = [t('search.all'), t('sections.cultura'), t('sections.atividades'), t('sections.restaurantes'), t('sections.alojamento')];

  // Fechar o mega menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Realizar scroll suave (auto-focus layout) para ver toda a pesquisa com folga para a Navbar
  useEffect(() => {
    if (isFocused && wrapperRef.current) {
      const y = wrapperRef.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [isFocused]);

  // Bloquear o scroll da página principal enquanto a SearchBar está focada
  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFocused]);

  // Fetch live do API do nosso backend
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!selectedFilter) return;

      setIsLoading(true);
      
      try {
        const queryParam = encodeURIComponent(searchQuery.trim());
        const categoryParam = encodeURIComponent(selectedFilter === t('search.all') ? '' : selectedFilter);
        
        const res = await fetch(`/api/places/search?q=${queryParam}&category=${categoryParam}`);
        const data = await res.json();
        if (data.results) {
           setLivePlaces(data.results);
        } else {
           setLivePlaces([]);
        }
      } catch(err) {
        console.error("Erro a fecthar live places na SearchBar", err);
        setLivePlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchPlaces();
    }, 450); // debounce
    
    return () => clearTimeout(timerId);
  }, [searchQuery, selectedFilter, t]);

  return (
    <div 
      ref={wrapperRef}
      className={`mx-auto mt-10 transition-all duration-500 ease-in-out relative z-50 ${
        isFocused ? 'max-w-6xl' : 'max-w-3xl'
      }`}
    >
      {/* O Backdrop DEVERÁ estar com z-[1] para ficar por cima do resto do site, mas por detrás do input (z-20) */}
      {isFocused && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity cursor-pointer z-[1]" 
          onClick={() => setIsFocused(false)}
        ></div>
      )}

      {/* Search Input Container */}
      <div 
        className={`bg-white border transition-all duration-300 relative z-20 ${
          isFocused 
            ? 'rounded-t-[2.5rem] rounded-b-none border-primary-500 shadow-xl ring-4 ring-primary-50' 
            : 'rounded-[2rem] border-slate-200 shadow-lg hover:border-primary-200 hover:shadow-xl'
        }`}
      >
        <div className="flex items-center p-2.5 bg-transparent">
          <div className="pl-5 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder={t('search.placeholder')} 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isFocused) setIsFocused(true);
            }}
            className="flex-grow py-3.5 px-4 outline-none text-slate-800 bg-transparent text-lg font-medium placeholder:text-slate-400"
            onFocus={() => setIsFocused(true)}
            onClick={() => setIsFocused(true)}
          />
          <button 
            onClick={() => setIsFocused(false)}
            className={`bg-primary-50 hover:bg-primary-100 text-primary-700 px-8 py-3.5 rounded-full font-bold transition-all shadow-sm shrink-0 whitespace-nowrap focus:outline-none ${isFocused ? 'block' : 'hidden'}`}
          >
            {t('search.close')}
          </button>
        </div>
      </div>

      {/* Floating Mega Menu Results */}
      <div 
        className={`absolute top-full left-0 w-full bg-white border border-slate-200 border-t-0 rounded-b-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 ease-in-out flex flex-col origin-top z-20 ${
          isFocused ? 'opacity-100 scale-y-100 h-[70vh] max-h-[800px] pointer-events-auto' : 'opacity-0 scale-y-95 h-0 pointer-events-none border-none shadow-none'
        }`}
      >
        {/* Filters Header inside Dropdown */}
        <div className="px-6 md:px-10 border-b border-slate-100 flex flex-wrap items-center gap-3 py-5 shrink-0 bg-white/80 backdrop-blur-md z-10 shadow-sm">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mr-4 shrink-0">{t('search.filterBy')}</span>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedFilter === filter 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-grow bg-slate-50">
          <div className="mb-6 flex justify-between items-end">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              {searchQuery ? `${t('search.resultsFor')} "${searchQuery}"` : `${t('search.exploring')} ${selectedFilter === t('search.all') ? t('search.detail') : selectedFilter}`}
            </h3>
            <span className="text-sm text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              {livePlaces.length} {t('search.discoveries')}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-xl font-medium text-slate-600 mt-4">A consultar mapas...</p>
            </div>
          ) : livePlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
              {livePlaces.map((place) => (
                <div key={place.id} onClick={(e) => e.stopPropagation()} className="transform hover:-translate-y-1 transition-transform duration-300">
                   <PlaceCard place={place} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-6">🔍</span>
              <p className="text-2xl font-bold text-slate-700">{t('search.noResults')}</p>
              <p className="text-slate-500 text-lg mt-2">{t('search.tryOthers')}</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedFilter(t('search.all')); }}
                className="mt-8 px-8 py-3.5 bg-primary-100 hover:bg-primary-200 text-primary-800 font-bold rounded-full transition-colors text-lg"
              >
                {t('search.clear')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
