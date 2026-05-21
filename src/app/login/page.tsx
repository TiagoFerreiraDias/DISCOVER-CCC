"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Email ou palavra-passe incorreta.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este email já está registado.");
      } else if (err.code === 'auth/weak-password') {
        setError("A palavra-passe tem de ter pelo menos 6 caracteres.");
      } else {
        setError("Ocorreu um erro ao comunicar com a base de dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError("Cancelou ou ocorreu um erro ao autenticar com o Google.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Absolute Logo Top Left */}
      <div className="absolute top-6 left-8 z-50">
        <Link href="/" className="inline-flex items-center hover:scale-105 transition-transform">
          <img src="/Logo sem fundo.png" alt="CCC Logo" className="h-14 w-auto drop-shadow-sm" />
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Criar uma conta"}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isLogin ? "Acede à tua conta para organizar os teus favoritos." : "Junta-te para guardares trilhos e restaurantes."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Tiago Silva"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="nome@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Palavra-passe</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 mt-2 text-lg active:scale-95"
            >
              {loading ? "A carregar..." : (isLogin ? "Entrar na Conta" : "Registar Gratuitamente")}
            </button>
          </form>

          <div className="relative flex items-center py-7">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">ou continua com</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          <p className="text-center text-sm text-slate-600 mt-8 font-medium">
            {isLogin ? "Ainda não tens conta?" : "Já tens uma conta?"}{" "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
            >
              {isLogin ? "Registar" : "Fazer Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
