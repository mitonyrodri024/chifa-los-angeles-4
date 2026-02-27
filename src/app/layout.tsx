// app/layout.js
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Fuente Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CHIFA LOS ANGELES - Auténtica Cocina China",
  description: "La sazón que pruebes! Auténtica cocina china en Los Angeles. Jr. Principal 123, +51 999 123 456",
  keywords: ["chifa", "comida china", "los angeles", "restaurante", "auténtico"],
  authors: [{ name: "CHIFA LOS ANGELES" }],
  openGraph: {
    title: "CHIFA LOS ANGELES - Auténtica Cocina China",
    description: "La sazón que pruebes! Auténtica cocina china en Los Angeles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#DC2626" />
        
        {/* Preconnect para mejorar performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* AuthProvider para manejar la autenticación en toda la app */}
        <AuthProvider>
          {/* CartProvider para manejar el carrito */}
          
            {/* Navbar - Ahora integrado con autenticación */}
            <Navbar />
            
            {/* Contenido principal con padding para evitar superposición con navbar fijo */}
            <main className="flex-grow pt-16 md:pt-20">
              {children}
            </main>
            
            <Footer />
    
        </AuthProvider>
        
        {/* Botón de WhatsApp flotante para móviles */}
        <a 
          href="https://wa.me/51999123456"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 md:hidden"
          aria-label="Contactar por WhatsApp"
        >
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
            <span className="text-white text-2xl">W</span>
          </div>
        </a>
      </body>
    </html>
  );
}