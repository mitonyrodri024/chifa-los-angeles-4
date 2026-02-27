import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from '@/types/user.types';

export const useProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setProfile(userData);
      } else {
        // Crear perfil básico si no existe
        const basicProfile: User = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phoneNumber: '',
          emailVerified: user.emailVerified || false,
          createdAt: new Date().toISOString(),
          role: 'user',
          address: '',
          city: ''
        };
        setProfile(basicProfile);
      }
    } catch (err: any) {
      setError('Error al cargar perfil');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const user = getCurrentUser();
    if (!user) {
      setError('No hay usuario autenticado');
      return { success: false, error: 'No hay usuario autenticado' };
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err: any) {
      setError('Error al actualizar perfil');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};