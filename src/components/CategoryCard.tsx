import React from 'react';
import Link from 'next/link';

export default function CategoryCard({ category }: { category: any }) {
  return (
    <Link href={`/explorar?categoria=${encodeURIComponent(category.title)}`} className="block w-full">
      <div className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm">
        <img 
          src={category.image} 
          alt={category.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-200"
        />
        {/* Dark gradient overlay so text is readable */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <h3 className="absolute bottom-4 left-4 font-bold text-xl md:text-2xl text-white">
          {category.title}
        </h3>
      </div>
    </Link>
  );
}
