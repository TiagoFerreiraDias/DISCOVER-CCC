"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PlaceCard({ place }: { place: any }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  // Verifica na base de dados se este local já está nos favoritos do user
  useEffect(() => {
    async function checkFavorite() {
      if (!user || !place.id) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'favorites_places', place.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error("Erro a ler favoritos:", err);
      }
    }
    checkFavorite();
  }, [user, place.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Impede o card de abrir a página quando apenas clicamos no coração
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!place.id) return;

    // Toggle local state imediatamente para dar feedback rápido (Optimistic UI)
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    const docRef = doc(db, 'users', user.uid, 'favorites_places', place.id);
    
    try {
      if (newFavoriteState) {
        // Guarda na base de dados, isolado no perfil deste utilizador
        await setDoc(docRef, {
          ...place,
          savedAt: new Date().toISOString()
        });
      } else {
        // Remove da base de dados se tiramos o coração
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.error(err);
      // Se der erro na net/bd, reverte o coração
      setIsFavorite(!newFavoriteState);
    }
  };
  return (
    <div 
      className="flex flex-col gap-2 group cursor-pointer" 
      onClick={() => router.push(`/local/${place.id}`)}
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden mb-3 shadow-sm border border-slate-100">
        <img 
          src={place.image} 
          alt={place.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-100"
        />
        {/* Heart Icon Button for Favorites */}
        <button 
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform active:scale-95"
          onClick={handleFavoriteClick}
        >
          <svg className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-800'}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>
        
        {place.tag && (
          <div className="absolute bottom-3 left-3 bg-white px-2 py-1 text-xs font-bold rounded shadow-sm border border-slate-100 text-slate-800">
            {place.tag}
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 leading-tight">
        {place.title}
      </h3>
      
      <div className="flex items-center gap-1 mt-1">
        <span className="text-sm font-bold text-slate-800">{place.rating}</span>
        <div className="flex gap-0.5 ml-1">
           {/* Dynamic 5 Green circles for TripAdvisor style */}
           {[...Array(5)].map((_, i) => {
             const ratingNum = parseFloat(place.rating?.toString().replace(',', '.') || '0');
             const isFull = i < Math.floor(ratingNum);
             const isHalf = i === Math.floor(ratingNum) && ratingNum % 1 >= 0.3;
             
             return (
               <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20">
                 {isFull ? (
                   <circle cx="10" cy="10" r="9" className="fill-primary-600" />
                 ) : isHalf ? (
                   <>
                     <circle cx="10" cy="10" r="9" className="fill-transparent stroke-primary-600 stroke-2" />
                     <path d="M 10 1.5 A 8.5 8.5 0 0 0 10 18.5 Z" className="fill-primary-600" />
                   </>
                 ) : (
                   <circle cx="10" cy="10" r="8.5" className="fill-transparent stroke-primary-600 stroke-2" />
                 )}
               </svg>
             );
           })}
        </div>
        <span className="text-sm text-slate-500 ml-1">({place.reviews})</span>
      </div>
      
    </div>
  );
}
