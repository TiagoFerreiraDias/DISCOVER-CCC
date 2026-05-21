"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar o mega menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ocultar Navbar na página de login, já que terá o seu próprio design fechado
  if (pathname === "/login") return null;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 py-4 px-4 md:px-8 flex justify-between items-center pointer-events-none transition-all">
        {/* Adicionado um leve gradiente/fundo no topo para que as barras sejam visíveis caso a página seja muito branca atrás */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent -z-10 pointer-events-none"></div>
        <div className="pointer-events-auto pt-1 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-700 hover:text-primary-600 hover:bg-white/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Abrir Menu Lateral"
          >
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      
      <div className="pointer-events-auto flex items-center gap-4">
        {loading ? (
          <div className="w-24 h-10 bg-slate-200 animate-pulse rounded-full"></div>
        ) : user ? (
          <div className="flex items-center gap-2 md:gap-4 relative" ref={menuRef}>
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 hover:text-primary-700 transition-colors text-slate-700 font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm">{language}</span>
            </button>

            {/* Avatar Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold text-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:bg-primary-700 active:scale-95 overflow-hidden"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-14 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="flex flex-col py-2">
                  <Link 
                    href="/perfil" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-700 w-full text-left transition-colors"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link 
                    href="/perfil" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-700 w-full text-left transition-colors"
                  >
                    {t('nav.favorites')}
                  </Link>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="px-6 py-2.5 bg-white/90 hover:bg-white text-primary-700 border border-primary-100 shadow-sm rounded-full font-bold transition-all hover:shadow-md backdrop-blur-sm focus:ring-2 focus:ring-primary-500">
            {t('nav.login')}
          </Link>
        )}
      </div>
      </header>
      
      {/* Renderizar a Sidebar Global */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
