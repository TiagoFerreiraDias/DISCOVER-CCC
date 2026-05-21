import React from 'react';
import Link from 'next/link';
import { getPlaceDetails } from '@/lib/places';
import FavoriteButton from '@/components/FavoriteButton';
import ImageGallery from '@/components/ImageGallery';

export default async function PlaceDetailTemplate({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const placeData = await getPlaceDetails(id);

  if (!placeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center pt-28">
        <div>
          <span className="text-6xl block mb-6">🏜️</span>
          <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Oásis Fantasma</h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">Infelizmente, a Google Places API não tem registo deste local nas suas coordenadas de GPS.</p>
          <Link href="/" className="px-8 py-3.5 border-2 border-slate-900 text-slate-900 font-bold rounded-full hover:bg-slate-900 hover:text-white transition-colors">Voltar para Santarém</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Spacer invisível */}
      <div className="h-28 w-full bg-white"></div>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
        
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">{placeData.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-600">
            <span className="flex items-center text-slate-900 font-bold">
              <svg className="w-4 h-4 text-amber-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              {placeData.rating} <span className="text-slate-500 font-normal ml-1 underline">({placeData.reviews} avaliações)</span>
            </span>
            <span>•</span>
            <span className="text-primary-600 font-bold">{placeData.category}</span>
            <span>•</span>
            <span>{placeData.address.split(',')[0]}</span>
          </div>
        </div>

        {/* Galeria de Fotos Interativa */}
        <ImageGallery images={placeData.images} />

        {/* Layout de Conteúdo Dividido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Coluna Esquerda: Descrição e Reviews */}
          <div className="lg:col-span-2 space-y-10">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Sobre este local</h2>
              {placeData.description.includes("O que as pessoas dizem") ? (
                <div className="bg-primary-50 text-primary-900 p-4 rounded-xl border border-primary-100 italic">
                  "A Google não tem uma descrição oficial para este local, mas a comunidade deixou-nos uma pista: {placeData.description.replace('O que as pessoas dizem desta experiência: ', '')}"
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">{placeData.description}</p>
              )}
            </section>

            <hr className="border-slate-100" />

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Experiências da Comunidade
                <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">{placeData.reviews} avaliações na Google</span>
              </h2>
              
              {placeData.rawReviews && placeData.rawReviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {placeData.rawReviews.slice(0, 4).map((review: any, i: number) => (
                    <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={review.profile_photo_url || "/monument.png"} alt={review.author_name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{review.author_name}</p>
                          <p className="text-xs text-slate-500">{review.relative_time_description}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <svg key={starIdx} className={`w-3.5 h-3.5 ${starIdx < review.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-4">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Ainda não existem avaliações escritas para este local.</p>
              )}
            </section>
          </div>
          
          {/* Coluna Direita: Widget de Informação Prática */}
          <div className="lg:col-span-1">
             <div className="sticky top-32 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
                <FavoriteButton place={placeData} />
                
                <a href={`https://www.google.com/maps/place/?q=place_id:${placeData.id}`} target="_blank" rel="noopener noreferrer" className="w-full bg-white text-slate-700 font-bold text-sm py-3 rounded-xl mb-8 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Abrir no Google Maps
                </a>

                <h3 className="font-bold text-slate-900 text-lg mb-4">Informação Prática</h3>
                
                <div className="space-y-4">
                  {/* Morada */}
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <div>
                      <span className="block font-semibold text-slate-800 text-sm">Morada</span>
                      <span className="text-sm text-slate-600">{placeData.address}</span>
                    </div>
                  </div>

                  {/* Telefone */}
                  {placeData.phone && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      <div>
                        <span className="block font-semibold text-slate-800 text-sm">Telefone</span>
                        <a href={`tel:${placeData.phone}`} className="text-sm text-primary-600 hover:underline">{placeData.phone}</a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {placeData.website && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                      <div className="overflow-hidden">
                        <span className="block font-semibold text-slate-800 text-sm">Website</span>
                        <a href={placeData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate block w-full">{new URL(placeData.website).hostname}</a>
                      </div>
                    </div>
                  )}

                  {/* Horários */}
                  {placeData.openingHours && placeData.openingHours.length > 0 && (
                    <div className="flex items-start gap-3 pt-2">
                      <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div className="w-full">
                        <span className="block font-semibold text-slate-800 text-sm mb-2">Horário de Funcionamento</span>
                        <ul className="text-xs text-slate-600 space-y-1 w-full">
                          {placeData.openingHours.map((hourStr, idx) => {
                            const [day, hours] = hourStr.split(': ');
                            return (
                              <li key={idx} className="flex justify-between border-b border-slate-50 pb-1">
                                <span className="font-medium text-slate-500">{day}</span>
                                <span className={hours === 'Encerrado' ? 'text-red-500 font-medium' : 'text-slate-800'}>{hours}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
