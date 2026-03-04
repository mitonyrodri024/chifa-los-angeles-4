// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';


export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-32">

      {/* Hero Section */}
      <section className="relative h-[75vh]">
        
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img 
            src="/presentacion.jpg"
            alt="Chifa Los Ángeles"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Botón sobre la imagen */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <button
            onClick={() => router.push('/menu')}
            className="px-8 py-4 bg-[#EC1F25] hover:bg-[#d41a1f] text-white font-bold rounded-xl text-lg transition-all hover:scale-105 shadow-lg inline-flex items-center gap-3"
          >
            <span>Explorar nuestro menú</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </section>

    </main>
  );
}