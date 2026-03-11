// TEMPORAL: Versión simplificada para debugging
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { User } from '@/types/user.types';

// AÑADIR ESTO: Lista de correos admin
const ADMIN_EMAILS = [
  'arodriguezb20_2@unc.edu.pe',
  // Puedes agregar más correos aquí
  'jhonatanalayachavez3@gmail.com'
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider - Inicializando...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('onAuthStateChanged llamado:', firebaseUser);
      
      if (firebaseUser) {
        // AÑADIR ESTO: Verificar si es admin
        const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
        
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Usuario',
          photoURL: firebaseUser.photoURL || '',
          phoneNumber: '',
          emailVerified: firebaseUser.emailVerified || true,
          createdAt: new Date().toISOString(),
          role: isAdmin ? 'admin' : 'user', // ← Aquí se asigna el rol
          address: '',
          city: ''
        };
        
        console.log('Usuario autenticado:', user);
        console.log('¿Es admin?:', isAdmin);
        setUser(user);
      } else {
        console.log('Usuario no autenticado');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider - Limpiando...');
      unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    setUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};