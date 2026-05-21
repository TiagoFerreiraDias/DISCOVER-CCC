"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { 
      name: t('nav.home'), 
      path: "/", 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> 
    },
    { 
      name: t('nav.explore'), 
      path: "/explorar", 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> 
    },
    { 
      name: t('nav.favorites'), 
      path: "/perfil", 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> 
    },
    {
      name: t('nav.routes'),
      path: "/rotas",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
    },
    {
      name: t('nav.events'),
      path: "/eventos",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    { 
      name: t('nav.profile'), 
      path: "/perfil", 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> 
    }
  ];

  return (
    <>
      {/* Backdrop de Escurecimento */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300" 
          onClick={onClose}
        />
      )}

      {/* Gaveta da Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-[280px] bg-[#fbf9f6] shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col pointer-events-auto`}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
             <img src="/Logo sem fundo.png" alt="CCC Logo" className="h-9 w-auto drop-shadow-sm" />
             <span className="text-xl font-bold text-slate-800 tracking-wide">{t('nav.menu')}</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" title="Fechar Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
          {menuItems.map((item, index) => {
            // Regra especial para o Início ("/") não ficar sempre ativo noutras rotas
            const isActive = item.path === '/' 
              ? pathname === '/' 
              : item.path !== '#' && pathname?.startsWith(item.path);
              
            const isProfile = item.name === t('nav.profile');
            
            return (
              <React.Fragment key={index}>
                {isProfile && <div className="mt-4 mb-2 border-t border-slate-200/60 pt-4"></div>}
                <Link 
                  href={item.path}
                  onClick={(e) => { 
                    if (item.path === '#') e.preventDefault(); 
                    else onClose(); 
                  }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                    isActive 
                      ? 'bg-primary-50 text-primary-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className={`${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </>
  );
}
