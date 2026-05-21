"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase';
import PlaceCard from '@/components/PlaceCard';
import Link from 'next/link';

export default function Perfil() {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // States para edição de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Proteção da Rota e inicialização
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, loading, router]);

  // Pesquisar favoritos
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const favQ = query(collection(db, 'users', user.uid, 'favorites_places'), orderBy('savedAt', 'desc'));
        const favSnap = await getDocs(favQ);
        setFavorites(favSnap.docs.map(doc => ({ ...doc.data(), docId: doc.id })));
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      } finally {
        setLoadingData(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (photoURL && photoURL.length > 2000) {
      setUpdateMsg('Erro: O link da imagem é demasiado comprido (provavelmente copiaste o código da imagem em vez do link). Tenta copiar apenas o "Endereço da Imagem".');
      return;
    }

    setUpdateLoading(true);
    setUpdateMsg('');
    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });
      setUpdateMsg('Perfil atualizado com sucesso! (Podes ter de atualizar a página para ver a nova foto)');
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-profile-attribute') {
        setUpdateMsg('Erro: Link da fotografia inválido ou demasiado longo.');
      } else {
        setUpdateMsg('Erro ao atualizar o perfil. Tenta novamente.');
      }
    } finally {
      setUpdateLoading(false);
      // Remove success message after 5 seconds
      setTimeout(() => setUpdateMsg(''), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  if (loading || (!user && !loading)) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28"><div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Spacer para a navbar */}
      <div className="h-28 w-full bg-slate-50 border-b border-slate-100"></div>
      
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        
        {/* SECÇÃO PRINCIPAL: GESTÃO DE CONTA */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            
            {/* Avatar / Foto de Perfil */}
            <div className="shrink-0 relative group">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-8 border-white shadow-xl overflow-hidden bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-6xl uppercase">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName ? user.displayName[0] : user.email?.[0] || 'U'
                )}
              </div>
            </div>

            {/* Detalhes do Utilizador & Ações */}
            <div className="flex-1 text-center md:text-left w-full pt-2 md:pt-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {user.displayName || 'Viajante Misterioso'}
              </h1>
              <p className="text-slate-500 font-medium text-lg mb-8">{user.email}</p>

              {!isEditing ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md"
                  >
                    Editar Perfil
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-8 py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                  >
                    Terminar Sessão
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-left max-w-lg mx-auto md:mx-0">
                  <h3 className="font-bold text-xl text-slate-800 mb-6">Atualizar Informações</h3>
                  
                  <div className="mb-5">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome de Exibição</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Como queres ser chamado?"
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-2">URL da Fotografia</label>
                    <input 
                      type="text" 
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-primary-500 bg-slate-50 focus:bg-white transition-colors text-sm"
                      placeholder="https://exemplo.com/minha-foto.jpg"
                    />
                    <p className="text-xs text-slate-400 mt-2 font-medium">Insere um link direto para uma imagem (JPG, PNG).</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.displayName || '');
                        setPhotoURL(user.photoURL || '');
                      }}
                      className="flex-1 py-3.5 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={updateLoading}
                      className="flex-1 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50"
                    >
                      {updateLoading ? 'A Guardar...' : 'Guardar Alterações'}
                    </button>
                  </div>
                </form>
              )}
              
              {updateMsg && !isEditing && (
                <div className={`mt-6 p-4 rounded-xl text-sm font-bold inline-block ${updateMsg.includes('Erro') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                  {updateMsg}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SECÇÃO SECUNDÁRIA: FAVORITOS */}
        <div className="pt-12 border-t-2 border-slate-50">
          <div className="flex items-center gap-4 mb-10">
             <h2 className="text-2xl font-bold text-slate-900">Os Teus Favoritos</h2>
             <span className="bg-slate-100 text-slate-600 font-bold px-4 py-1.5 rounded-full text-sm">
               {loadingData ? '...' : favorites.length} {favorites.length === 1 ? 'local' : 'locais'}
             </span>
          </div>

          {loadingData ? (
             <div className="w-full py-10 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"></div></div>
          ) : (
            <div className="w-full">
              {favorites.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((place, index) => (
                       <PlaceCard key={index} place={place} />
                    ))}
                 </div>
              ) : (
                 <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
                    <span className="text-5xl mb-4 block opacity-40">❤️</span>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Ainda não tens favoritos</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Começa a explorar Santarém e guarda aqui os teus locais favoritos para os visitares mais tarde.</p>
                    <Link href="/explorar" className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-sm">
                      Explorar Santarém
                    </Link>
                 </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
