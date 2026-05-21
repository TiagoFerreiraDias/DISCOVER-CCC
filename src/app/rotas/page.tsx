"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function RotasPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Route Creator State
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [selectedPlacesForRoute, setSelectedPlacesForRoute] = useState<string[]>([]);
  const [isSavingRoute, setIsSavingRoute] = useState(false);

  // Proteção da Rota
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Pesquisar favoritos (para criar rotas) e rotas existentes
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const favQ = query(collection(db, 'users', user.uid, 'favorites_places'), orderBy('savedAt', 'desc'));
        const favSnap = await getDocs(favQ);
        setFavorites(favSnap.docs.map(doc => ({ ...doc.data(), docId: doc.id })));

        const routeQ = query(collection(db, 'users', user.uid, 'routes'), orderBy('createdAt', 'desc'));
        const routeSnap = await getDocs(routeQ);
        setItineraries(routeSnap.docs.map(doc => ({ ...doc.data(), routeId: doc.id })));

      } catch (err) {
        console.error("Erro ao carregar dados de rotas:", err);
      } finally {
        setLoadingData(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateRoute = async () => {
    if (!newRouteName.trim() || selectedPlacesForRoute.length === 0 || !user) return;
    setIsSavingRoute(true);
    
    const routePlaces = favorites.filter(fav => selectedPlacesForRoute.includes(fav.docId));

    try {
      const newRoute = {
        name: newRouteName,
        places: routePlaces.map((p, idx) => {
           let cleanId = p.id || p.docId || `custom_${idx}`;
           if (typeof cleanId === 'string' && cleanId.startsWith('places/')) {
             cleanId = cleanId.replace('places/', '');
           }
           return {
             order: idx + 1,
             id: cleanId, 
             name: p.title || p.name || "Ponto de Interesse",
             category: p.category || "Turismo",
             image: p.image || (p.images && p.images.length > 0 ? p.images[0] : "/monument.png")
           };
        }),
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'routes'), newRoute);
      setItineraries([{ ...newRoute, routeId: docRef.id }, ...itineraries]);
      
      setIsCreatingRoute(false);
      setNewRouteName("");
      setSelectedPlacesForRoute([]);
    } catch (error) {
      console.error("Erro ao gravar itinerário no Firebase:", error);
      alert("Houve um erro a gravar. Vê a consola para mais detalhes.");
    } finally {
      setIsSavingRoute(false);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'routes', routeId));
      setItineraries(itineraries.filter(r => r.routeId !== routeId));
    } catch (err) {
      console.error("Erro ao apagar rota:", err);
    }
  };

  if (loading || (!user && !loading)) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28">{t('profile.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] pb-20">
      <div className="h-28 w-full bg-[#fbf9f6] border-b border-slate-200/60"></div>
      
      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">{t('nav.routes')}</h1>
        </div>

        {loadingData ? (
           <div className="w-full py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"></div></div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex gap-4 items-center">
                 <h2 className="text-2xl font-bold text-slate-800">{t('profile.myRoutes')}</h2>
                 <span className="bg-primary-50 text-primary-700 border border-primary-200 font-bold px-3 py-1 rounded-full text-sm">{itineraries.length}</span>
              </div>
              
              {!isCreatingRoute && itineraries.length < 3 && (
                <button 
                  onClick={() => setIsCreatingRoute(true)} 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  {t('profile.createRoute')}
                </button>
              )}
            </div>

            {isCreatingRoute && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm mb-4 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">{t('profile.newRoute')}</h3>
                <input 
                  type="text" 
                  placeholder={t('profile.routeNameInput')} 
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-50 font-medium text-slate-800 mb-4 shadow-sm"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                />
                
                <p className="text-sm font-bold text-slate-600 mb-3">{t('profile.selectPlaces')} ({selectedPlacesForRoute.length}):</p>
                {favorites.length === 0 ? (
                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm mb-4">
                     {t('profile.noFavoritesYet')}
                   </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                    {favorites.map(place => {
                      const uniqueId = place.docId;
                      return (
                      <label key={uniqueId} className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-primary-50 transition-colors border border-slate-200 shadow-sm">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500 accent-primary-600"
                          checked={selectedPlacesForRoute.includes(uniqueId)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPlacesForRoute([...selectedPlacesForRoute, uniqueId]);
                            else setSelectedPlacesForRoute(selectedPlacesForRoute.filter(id => id !== uniqueId));
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700 line-clamp-1">{place.title || place.name}</span>
                      </label>
                    )})}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setIsCreatingRoute(false)} className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors">{t('profile.cancel')}</button>
                  <button 
                    onClick={handleCreateRoute} 
                    disabled={isSavingRoute || !newRouteName.trim() || selectedPlacesForRoute.length === 0}
                    className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-md"
                  >
                    {isSavingRoute ? t('profile.saving') : t('profile.saveRoute')}
                  </button>
                </div>
              </div>
            )}

            {itineraries.length >= 3 && !isCreatingRoute && (
               <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg></div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">{t('profile.freeLimitTitle')}</h4>
                    <p className="text-xs text-amber-700 mt-1">{t('profile.freeLimitDesc')}</p>
                    <button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">{t('profile.unlockPremium')}</button>
                  </div>
               </div>
            )}

            {itineraries.length === 0 && !isCreatingRoute ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                 <span className="text-4xl mb-4 block">🗺️</span>
                 <p className="text-slate-500 font-medium">{t('profile.noRoutes')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itineraries.map(route => (
                  <div key={route.routeId} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group relative flex flex-col">
                    <button onClick={() => handleDeleteRoute(route.routeId)} className="absolute top-5 right-5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <h4 className="font-bold text-slate-800 text-xl mb-1 pr-8">{route.name}</h4>
                    <p className="text-xs text-slate-400 mb-4 font-bold uppercase tracking-wider">{route.places?.length || 0} {t('profile.stops')}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {route.places?.slice(0, 3).map((p: any, i: number) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                          {p.name}
                        </span>
                      ))}
                      {route.places?.length > 3 && (
                        <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-lg font-bold">+{route.places.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <Link href={`/itinerario/${route.routeId}`} className="block w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-center text-sm rounded-xl hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        {t('profile.openMap')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
