// components/ui/FloatingWhatsApp.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // 🚫 Ocultar específicamente en la página de checkout
    // Esto oculta en /checkout y cualquier subruta como /checkout/something
    if (pathname?.startsWith('/checkout')) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [pathname]);

  // Si no es visible, no renderizar nada
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <a
        href="https://wa.me/51976039735"
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:scale-110 transition-transform duration-300 group"
        aria-label="Contactar por WhatsApp"
      >
        {/* Tooltip flotante */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          📱 ¿Necesitas ayuda?
        </span>
        
        {/* Contenedor con efecto de pulso */}
        <div className="relative">
          {/* Círculo de pulso */}
          <div className="absolute -inset-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
          
          {/* Círculo de fondo */}
          <div className="absolute -inset-2 bg-green-500 rounded-full opacity-20"></div>
          
          {/* Icono de WhatsApp */}
          <div className="relative">
            <Image 
              src="/whatsapp.png" 
              alt="WhatsApp Ventas" 
              width={64} 
              height={64} 
              className="w-14 h-14 md:w-16 md:h-16 shadow-2xl rounded-full border-2 border-white hover:border-green-100 transition-colors"
              priority
            />
            
            {/* Indicador "En línea" */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </a>
    </div>
  );
}