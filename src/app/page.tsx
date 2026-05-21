"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PlaceCard from "@/components/PlaceCard";
import CategoryCard from "@/components/CategoryCard";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [featuredPlaces, setFeaturedPlaces] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  
  const categories = [
    { title: t('sections.cultura'), image: "/monument.png" },
    { title: t('sections.atividades'), image: "/nature.png" },
    { title: t('sections.restaurantes'), image: "/food.png" },
    { title: t('sections.alojamento'), image: "/river.png" },
  ];

  // Fetch featured places dynamically to ensure images are always fresh
  useEffect(() => {
    async function fetchFeatured() {
      try {
        // Usamos o nosso endpoint de pesquisa para obter os destaques reais
        const res = await fetch('/api/places/search');
        const data = await res.json();
        if (data.results) {
          // Pegamos os primeiros 4 para a home
          setFeaturedPlaces(data.results.slice(0, 4));
        }
      } catch (err) {
        console.error("Erro a carregar destaques:", err);
      } finally {
        setIsLoadingFeatured(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-24 pb-16 px-6 bg-gradient-to-b from-[#faeed7] to-white relative z-20">
        <div className="max-w-4xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-800">
            CCC
          </h1>
          <h2 className="text-2xl md:text-3xl text-primary-600 font-medium">
            {t('hero.title')}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto pt-4 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          {/* TripAdvisor Style Search Bar Component */}
          <SearchBar />
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('sections.discover')}</h2>
          <p className="text-slate-600">{t('sections.discover_sub')}</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <CategoryCard key={i} category={cat} />
          ))}
        </div>
      </section>

      {/* Places / Experiences Section */}
      <section className="max-w-7xl mx-auto w-full px-6 py-6 mb-24">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('search.exploring')} Santarém</h2>
          <p className="text-slate-600">{t('hero.subtitle')}</p>
        </div>
        
        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlaces.map((place, i) => (
              <PlaceCard key={i} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
