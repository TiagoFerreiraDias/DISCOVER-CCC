import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CCC | Continents, Countries and Cities",
  description: "O teu ponto de partida para explorar Santarém de forma intuitiva. Rotas, viagens e locais de interesse num só lugar.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${inter.variable} antialiased h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-grow flex flex-col text-slate-800">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
