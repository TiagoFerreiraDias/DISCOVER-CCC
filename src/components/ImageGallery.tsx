"use client";

import React, { useState, useEffect } from 'react';

export default function ImageGallery({ images }: { images: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => setIsOpen(false);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Bloqueia o scroll da página quando a galeria está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Controlos de Teclado (Setas e Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length]);

  return (
    <>
      {/* Grelha Estilo Airbnb */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] mb-12 rounded-2xl overflow-hidden group">
        <div className="md:col-span-2 h-full w-full relative" onClick={() => openLightbox(0)}>
          <img src={images[0]} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" alt="Foto principal" />
        </div>
        <div className="hidden md:grid col-span-2 grid-cols-2 grid-rows-2 gap-2 h-full">
          {images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="h-full w-full relative" onClick={() => openLightbox(idx + 1)}>
              <img src={img} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" alt={`Foto ${idx+2}`} />
            </div>
          ))}
          {images.length < 5 && Array.from({length: 5 - images.length}).map((_, idx) => (
            <div key={`fill-${idx}`} className="h-full w-full bg-slate-100 flex items-center justify-center">
               <span className="text-slate-300 text-sm">Sem mais fotos</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Lightbox (Estilo Windows Photos) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* Cabeçalho do Visor */}
          <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center text-white/70 z-[110]">
            <div className="text-sm md:text-base font-medium tracking-widest uppercase">
               {currentIndex + 1} / {images.length}
            </div>
            <button 
              className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              title="Fechar (Esc)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Botão Anterior */}
          {images.length > 1 && (
            <button 
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
              onClick={prevImage}
              title="Anterior (Seta Esquerda)"
            >
              <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
          )}

          {/* Contentor da Imagem Principal */}
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4 md:p-16 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[currentIndex]} 
              className="max-w-full max-h-full object-contain rounded shadow-2xl select-none" 
              alt={`Vista detalhada ${currentIndex + 1}`} 
            />
          </div>

          {/* Botão Seguinte */}
          {images.length > 1 && (
            <button 
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
              onClick={nextImage}
              title="Próxima (Seta Direita)"
            >
              <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
