"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from "@/context/LanguageContext";

interface EventDetail {
  title: string;
  description: string;
  date: string | null;
  image?: string;
  location?: string;
  category: string;
}

export default function EventoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // O ID será o link codificado ou um slug
        const res = await fetch(`/api/events/detail?id=${params.id}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.event);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhe do evento:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Evento não encontrado</h1>
        <button 
          onClick={() => router.push('/eventos')}
          className="mt-6 px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl"
        >
          Voltar à Agenda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section with Image */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-6xl">📅</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-5xl mx-auto">
            <button 
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <span className="bg-primary-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
              {event.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 md:px-16 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Sobre o evento</h2>
              <div 
                className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-lg border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Detalhes</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Data</p>
                    <p className="text-slate-800 font-bold">{event.date ? new Date(event.date).toLocaleDateString(language === 'PT' ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "A definir"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Localização</p>
                    <p className="text-slate-800 font-bold">{event.location || "Santarém, Portugal"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Block Removed for informative-only purpose */}
          </div>

        </div>
      </div>
    </div>
  );
}
