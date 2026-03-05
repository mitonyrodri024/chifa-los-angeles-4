// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-32">

      {/* Hero Section con texto */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-700 min-h-[75vh] flex items-center">

        {/* Decoración de fondo con patrones chinos/peruanos */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="grid grid-cols-6 gap-4 rotate-12 opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="text-white text-4xl font-bold">龍</div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Título decorativo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4">
              <img
                src="/logo/logo.png"
                alt="Logo"
                className="w-32 h-32 object-contain"
              />              
            </div>
          </div>

          {/* Texto de Nuestra Historia */}
          <div className="max-w-4xl mx-auto text-white space-y-8">

            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-8 relative">
              <span className="relative inline-block">
                Nuestra Historia:
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-400 rounded-full"></span>
              </span>
              <span className="block text-yellow-300 text-3xl md:text-4xl mt-4">
                El Sabor que nos Une
              </span>
            </h1>

            {/* Párrafos con estilo */}
            <div className="space-y-6 text-lg md:text-xl leading-relaxed">
              <p className="text-white/95 border-l-4 border-yellow-400 pl-6 italic">
                "La cultura peruana y china se fundieron para dar origen a una increíble fusión
                de sabores, colores e insumos que hoy, con mucho orgullo, presentamos a través
                de nuestra mesa."
              </p>

              <p>
                En <span className="font-bold text-yellow-300">Chifa Los Angeles</span>, honramos
                este mestizaje que se remonta a la inmigración china de mediados del siglo XIX;
                una herencia que llegó para quedarse y mezclarse con nuestra identidad, dando vida
                a los platos más exquisitos de nuestra gastronomía.
              </p>

              <p>
                Lo que comenzó como un sueño familiar en nuestra querida Cajamarca hace más de 15 años,
                se ha convertido, gracias a su preferencia y nuestra dedicación, en un referente
                culinario de la región. Hoy, con 4 locales a su servicio, nuestra propuesta sigue
                destacando por la calidad y frescura de los ingredientes orientales y peruanos que
                sobresalen en cada bocado.
              </p>

              {/* Frase destacada */}
              <div className="text-center pt-6">
                <p className="text-2xl font-bold text-yellow-300 border-t border-white/30 pt-6 inline-block px-12">
                  "La sazón que prefieres, ahora más cerca de ti."
                </p>
              </div>
            </div>

            {/* Botón de llamado a la acción */}
            <div className="flex justify-center pt-12">
              <button
                onClick={() => router.push('/menu')}
                className="px-10 py-5 bg-yellow-400 hover:bg-yellow-500 text-red-700 font-bold rounded-xl text-xl transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-3 group"
              >
                <span>Explorar nuestro menú</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Decoración inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-transparent to-yellow-400 opacity-50"></div>
        </div>

      </section>

    </main>
  );
}