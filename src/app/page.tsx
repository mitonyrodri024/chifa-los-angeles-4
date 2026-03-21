// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Utensils, Phone, MapPin } from 'lucide-react';

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

          {/* Título decorativo - SOLO EL LOGO */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4">
              <img
                src="/logo/logo.png"
                alt="Logo"
                className="w-28 h-28 md:w-32 md:h-32 object-contain"
              />              
            </div>
          </div>

          {/* BOTONES DE ACCESO AL MENÚ - Justo después del logo */}
          <div className="flex flex-col items-center gap-4 mb-12">
            {/* Botón principal - VER MENÚ COMPLETO */}
            <button
              onClick={() => router.push('/menu')}
              className="px-8 py-4 md:px-12 md:py-6 bg-yellow-400 hover:bg-yellow-500 text-red-700 font-bold rounded-xl text-xl md:text-2xl transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-3 md:gap-4 group w-full max-w-2xl justify-center"
            >
              <Utensils className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
              <span>VER MENÚ COMPLETO</span>
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
            </button>
            
            
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

            {/* SECCIÓN DE CONTACTO - Teléfonos y dirección */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mt-8 border-2 border-yellow-400/30">
              
              {/* Título de la sección */}
              <h2 className="text-3xl font-bold text-center mb-6 text-yellow-300">
                Contáctanos
              </h2>
              
              {/* Descripción */}
              <p className="text-center text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Estamos ubicados en Cajamarca con 4 locales a tu disposición. 
                Realiza tus pedidos o consultas a nuestros números:
              </p>

              {/* Grid de teléfonos y dirección */}
              <div className="grid md:grid-cols-3 gap-6">
                              

                {/* Teléfono 2 */}
                <div className="bg-white/5 rounded-xl p-6 text-center hover:bg-white/10 transition-all group border border-white/10 hover:border-yellow-400/50">
                  <div className="bg-yellow-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Phone className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-yellow-400">976 039 735 </p>
                    <p className="text-sm text-white/70">Reservas y eventos</p>
                  </div>
                </div>

                {/* Dirección */}
                <div className="bg-white/5 rounded-xl p-6 text-center hover:bg-white/10 transition-all group border border-white/10 hover:border-yellow-400/50">
                  <div className="bg-yellow-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-white">Jr. Ayacucho 1478</p>
                    <p className="text-sm text-white/70">Cajamarca - Perú</p>
                    
                  </div>
                </div>
              </div>

              {/* Horario de atención */}
              <div className="mt-8 text-center text-white/80 border-t border-white/20 pt-6">
                <p className="inline-flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full">
                  <span className="text-yellow-400 font-semibold">🕒 Atención:</span>
                  Lunes a Domingo 11:00 am - 11:00 pm
                </p>
              </div>
            </div>

          </div>

          {/* Decoración inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-transparent to-yellow-400 opacity-50"></div>
        </div>

      </section>

    </main>
  );
}