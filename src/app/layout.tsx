// app/layout.js
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
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
  metadataBase: new URL("https://chifa-los-angeles-4.com"), // Cambia cuando tengas dominio real

  title: {
    default: "CHIFA LOS ANGELES | Restaurante de Comida China",
    template: "%s | CHIFA LOS ANGELES"
  },

  description:
    "Auténtica cocina china en Los Angeles. Disfruta nuestro chifa con la mejor sazón. Jr. Principal 123. Pedidos al +51 999 123 456.",

  keywords: [
    "chifa en los angeles",
    "comida china",
    "restaurante chino",
    "delivery comida china",
    "chifa los angeles"
  ],

  authors: [{ name: "CHIFA LOS ANGELES" }],

  creator: "CHIFA LOS ANGELES",

  openGraph: {
    title: "CHIFA LOS ANGELES | Auténtica Cocina China",
    description:
      "La sazón que pruebes. Restaurante de comida china con atención presencial y pedidos por WhatsApp.",
    url: "https://chifa-los-angeles-4.com",
    siteName: "CHIFA LOS ANGELES",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "CHIFA LOS ANGELES - Restaurante de comida china"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "CHIFA LOS ANGELES | Restaurante Chino",
    description: "Auténtica comida china en Los Angeles.",
    images: ["/presentacion.jpg"]
  },

  robots: {
    index: true,
    follow: true
  }
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
          <main className="flex-grow pt-2 md:pt-2">
            {children}
          </main>

          <Footer />

        </AuthProvider>

        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 md:hidden">

          <a
            href="https://wa.me/51963753366"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
              <Image src="/whatsapp.png" alt="WhatsApp Ventas" width={28} height={28} />
            </div>
          </a>         

        </div>
      </body>
    </html>
  );
}