"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          {/* Logo e Info Esquerda */}
          <div className="text-center md:text-left">
            <Link href="/" className="font-black text-2xl tracking-tighter text-slate-800 block mb-2">
              Discover<span className="text-primary-600">CCC</span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed">
              Plataforma desenvolvida no âmbito da Prova de Aptidão Profissional (PAP). O teu ponto de partida elegante para explorar Santarém.
            </p>
          </div>

          {/* Info Direita (Autor e Curso) */}
          <div className="text-center md:text-right bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
            <p className="font-bold text-slate-800 text-base">Tiago Dias</p>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-1">Programador de Informática</p>
            <p className="text-xs text-slate-500">Curso de Programador de Informática</p>
            <p className="text-xs text-slate-500">Escola Secundária Ginestal Machado</p>
          </div>

        </div>

        {/* Linha de Fundo */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>Copyright © {new Date().getFullYear()} Discover CCC. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/" onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="hover:text-primary-600 transition-colors font-medium">Início</Link>
            <Link href="/perfil" className="hover:text-primary-600 transition-colors font-medium">Rotas</Link>
            <Link href="/login" className="hover:text-primary-600 transition-colors font-medium">Login</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}

