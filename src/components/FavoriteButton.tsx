"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FavoriteButton({ place }: { place: any }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkFavorite() {
      if (!user || !place.id) {
        setIsLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid, 'favorites_places', place.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error("Erro a ler favoritos:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkFavorite();
  }, [user, place.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!place.id) return;

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    const docRef = doc(db, 'users', user.uid, 'favorites_places', place.id);
    
    try {
      if (newFavoriteState) {
        await setDoc(docRef, {
          ...place,
          savedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.error(err);
      setIsFavorite(!newFavoriteState);
    }
  };

  if (isLoading) {
    return (
      <button disabled className="w-full bg-slate-100 text-slate-400 font-bold text-lg py-4 rounded-xl mb-6 shadow-sm flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-400 rounded-full animate-spin"></div>
      </button>
    );
  }

  return (
    <button 
      onClick={handleFavoriteClick}
      title={isFavorite ? 'Remover dos Favoritos' : 'Guardar nos Favoritos'}
      className={`w-full font-bold text-lg py-4 rounded-xl mb-6 transition-colors shadow-md flex items-center justify-center ${
        isFavorite 
          ? 'bg-red-50 hover:bg-red-100 text-red-500 border border-red-200' 
          : 'bg-slate-900 text-white hover:bg-primary-600'
      }`}
    >
      <svg className="w-7 h-7" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
    </button>
  );
}
