"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

type Language = 'PT' | 'EN';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'PT',
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: () => '',
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('PT');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ccc-lang') as Language;
    if (saved && (saved === 'PT' || saved === 'EN')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ccc-lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'PT' ? 'EN' : 'PT');
  };

  // Procura no dicionário pela chave de caminho. Ex: t('nav.profile')
  const t = (path: string) => {
    const keys = path.split('.');
    let result: any = translations[language];
    
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
         // Fallback de segurança para PT se a chave Inglesa faltar
         let fallback: any = translations['PT'];
         for (const fallbackKey of keys) {
             if (fallback) fallback = fallback[fallbackKey];
         }
         return fallback || path;
      }
    }
    return result;
  };

  // Previne flickering antes do side-effect correr e detetar as local variables
  if (!mounted) {
     return null;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
