'use client';

import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname(); // Importante: saber en qué página estamos

  useEffect(() => {
    console.log('🔒 ProtectedRoute - Estado actual:', { 
      user: user ? 'Sí' : 'No', 
      loading, 
      requireAdmin,
      currentPath: pathname
    });
    
    // Solo redirigir si NO estamos cargando
    if (!loading) {
      // Si no hay usuario, redirigir a login
      if (!user) {
        console.log('🔒 ProtectedRoute - Sin usuario, redirigiendo a login');
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      
      // Si requiere admin pero no es admin
      if (requireAdmin && user.role !== 'admin') {
        console.log('🔒 ProtectedRoute - No es admin, redirigiendo a home');
        router.push('/');
        return;
      }
      
      console.log('🔒 ProtectedRoute - Acceso permitido');
    }
  }, [user, loading, router, requireAdmin, pathname]);

  // Mostrar spinner mientras carga
  if (loading) {
    console.log('🔒 ProtectedRoute - Mostrando spinner (loading...)');
    return <LoadingSpinner fullScreen />;
  }

  // Si no hay usuario después de cargar
  if (!user) {
    console.log('🔒 ProtectedRoute - Usuario nulo después de carga');
    return null;
  }

  // Si requiere admin pero no es admin
  if (requireAdmin && user.role !== 'admin') {
    console.log('🔒 ProtectedRoute - No es admin (render null)');
    return null;
  }

  console.log('🔒 ProtectedRoute - Renderizando contenido protegido');
  return <>{children}</>;
}