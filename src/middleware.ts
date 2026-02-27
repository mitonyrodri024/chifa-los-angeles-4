// src/middleware.ts - Versión compatible con Firebase
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que NO requieren autenticación
  const publicPaths = [
    '/', 
    '/login', 
    '/register', 
    '/api/auth/callback',
    '/api/auth/session'
  ];
  
  // Si es ruta pública, permitir
  if (publicPaths.some(path => pathname === path)) {
    return NextResponse.next();
  }

  // Rutas que SI requieren autenticación
  const protectedPaths = [
    '/profile',
    '/profile/edit',
    '/orders',
    '/admin'
  ];

  // Si NO es una ruta protegida, permitir
  const isProtectedRoute = protectedPaths.some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Para rutas protegidas, necesitas una lógica diferente
  // Ya que Firebase maneja su propia autenticación
  // Por ahora, permitimos el acceso y dejamos que el cliente maneje la redirección
  console.log(`🛡️ Middleware - Ruta protegida detectada: ${pathname}`);
  console.log(`🛡️ Middleware - Dejando que el cliente (ProtectedRoute) maneje la autenticación`);
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger solo rutas específicas, no todas
    '/profile/:path*',
    '/orders/:path*',
    '/admin/:path*'
  ],
};