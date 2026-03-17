'use client';

import { Phone, MapPin, Clock, Facebook, Instagram, Youtube, Music2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-[#35363A] text-white">
            {/* Sección superior del footer */}
            <div className="border-b border-[#2A2B2E]">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Columna 1: Logo y eslogan */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="relative w-16 h-16">
                                        <Image
                                            src="/logo/logo.png"
                                            alt="CHIFA LOS ANGELES Logo"
                                            fill
                                            className="object-contain"
                                            sizes="64px"
                                            priority
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FFF100] rounded-full border-3 border-[#35363A]"></div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        <span className="text-white">CHIFA</span>{' '}
                                        <span className="text-[#EC1F25]">LOS ANGELES</span>
                                    </h2>
                                    <p className="text-sm text-gray-300">Desde 1995</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-lg font-semibold text-[#FFF100] italic">
                                    "La mejor experiencia de comida oriental en Cajamarca"
                                </p>
                                <p className="text-gray-300">
                                    Sabores auténticos que conquistan paladares, tradición china en cada plato.
                                </p>
                            </div>
                        </div>

                        {/* Columna 2: Información de contacto */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-l-4 border-[#EC1F25] pl-3">
                                Contacto Directo
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 group">
                                    <div className="w-10 h-10 bg-[#EC1F25] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFF100] group-hover:text-[#EC1F25] transition-all duration-300">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Reservas y Pedidos</p>
                                        <a
                                            href="tel:+51963753366"
                                            className="text-lg font-bold hover:text-[#FFF100] transition-colors duration-300"
                                        >
                                            +51 963 753 366
                                        </a>
                                        <p className="text-sm text-gray-400">Delivery disponible</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 group">
                                    <div className="w-10 h-10 bg-[#EC1F25] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFF100] group-hover:text-[#EC1F25] transition-all duration-300">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Visítanos</p>
                                        <p className="text-lg">Jr. Ayacucho 1478</p>
                                        <p className="text-gray-400">Cajamarca, Perú</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 group">
                                    <div className="w-10 h-10 bg-[#EC1F25] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFF100] group-hover:text-[#EC1F25] transition-all duration-300">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Horario de Atención</p>
                                        <p className="text-lg">Todos los días</p>
                                        <p className="text-gray-400">11:00 AM - 11:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna 3: Redes sociales y CTA */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-l-4 border-[#EC1F25] pl-3">
                                Síguenos
                            </h3>

                            <div className="space-y-4">
                                <p className="text-gray-300">
                                    Mantente al día con nuestras ofertas y nuevos platos
                                </p>

                                {/* Redes sociales con colores reales */}
                                <div className="flex gap-4">
                                    {/* Facebook */}
                                    <a
                                        href="https://www.facebook.com/Chifalosangeles4"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-[#2A2B2E] rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:scale-110 transition-all duration-300 group"
                                        aria-label="Facebook"
                                    >
                                        <Facebook className="w-6 h-6 text-white" />
                                    </a>

                                    {/* Instagram */}
                                    <a
                                        href="https://www.instagram.com/chifalosangeles4/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-[#2A2B2E] rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:scale-110 transition-all duration-300 group"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-6 h-6 text-white" />
                                    </a>

                                    {/* YouTube */}
                                    <a
                                        href="https://www.youtube.com/@chifa-los-angeles-4"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-[#2A2B2E] rounded-full flex items-center justify-center hover:bg-[#FF0000] hover:scale-110 transition-all duration-300 group"
                                        aria-label="YouTube"
                                    >
                                        <Youtube className="w-6 h-6 text-white" />
                                    </a>

                                    {/* TikTok */}
                                    <a
                                        href="https://www.tiktok.com/@chifalosangeles4"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-[#2A2B2E] rounded-full flex items-center justify-center hover:bg-black hover:scale-110 transition-all duration-300 group relative overflow-hidden"
                                        aria-label="TikTok"
                                    >
                                        <Music2 className="w-6 h-6 text-white relative z-10" />
                                        {/* Efecto de gradiente de TikTok */}
                                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#FE2C55]"></div>
                                    </a>
                                </div>

                                {/* Frases destacadas */}
                                <div className="space-y-3 pt-4">
                                    <div className="bg-[#2A2B2E]/50 rounded-lg p-4 border-l-4 border-[#FFF100]">
                                        <p className="font-medium text-[#FFF100]">"El auténtico sabor chino"</p>
                                        <p className="text-sm text-gray-300">Más de 25 años de tradición</p>
                                    </div>

                                    <div className="bg-[#2A2B2E]/50 rounded-lg p-4 border-l-4 border-[#EC1F25]">
                                        <p className="font-medium text-white">"Calidad y sabor inigualables"</p>
                                        <p className="text-sm text-gray-300">Ingredientes frescos cada día</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección inferior del footer */}
            <div className="bg-[#2A2B2E]">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Carrito flotante para móvil */}
                        <div className="md:hidden w-full mb-4">
                            <button className="w-full py-3 bg-[#EC1F25] text-white font-bold rounded-lg hover:bg-[#D81C21] transition-colors duration-300 flex items-center justify-center gap-3">
                                <ShoppingCart className="w-5 h-5" />
                                <span>Ver Carrito (3 items)</span>
                            </button>
                        </div>

                        {/* Derechos reservados */}
                        <div className="text-center md:text-left">
                            <p className="text-gray-400">
                                © {new Date().getFullYear()} CHIFA LOS ANGELES. Todos los derechos reservados.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Auténtica cocina china · La sazón que pruebes!
                            </p>
                        </div>

                        {/* Información adicional */}
                        <div className="text-center md:text-right">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#FFF100] rounded-full animate-pulse"></div>
                                    <span className="text-sm text-gray-300">Abierto ahora</span>
                                </div>
                                <div className="hidden md:block text-gray-500">|</div>
                                <p className="text-sm text-gray-300">
                                    Diseñado con ❤️ para Cajamarca
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Frase final destacada */}
                    <div className="mt-6 pt-4 border-t border-[#35363A] text-center">
                        <p className="text-lg font-bold text-[#FFF100] italic">
                            "Donde cada bocado es una experiencia oriental inolvidable"
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}