// src/app/debug/page.tsx
'use client';

import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useEffect } from 'react';

export default function DebugPage() {
  const { user, loading, error } = useAuthContext();

  useEffect(() => {
    console.log('DEBUG - Auth State:', { user, loading, error });
  }, [user, loading, error]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">DEBUG - Estado de Autenticación</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Estado Actual:</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'Ninguno'}</p>
          <p><strong>Usuario:</strong> {user ? 'Autenticado' : 'No autenticado'}</p>
        </div>
      </div>

      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Datos del Usuario:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-bold">Problemas comunes:</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Verifica que las reglas de Firestore permitan lectura/escritura</li>
          <li>Verifica que el usuario esté creado en la colección 'users'</li>
          <li>Verifica que el email esté verificado (si configuraste esa validación)</li>
          <li>Revisa la consola del navegador para ver errores</li>
        </ol>
      </div>
    </div>
  );
}