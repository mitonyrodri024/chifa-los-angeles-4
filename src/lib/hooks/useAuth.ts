import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser,
  updateUserProfile 
} from '@/lib/firebase/auth';

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginWithEmail(email, password);
      if (result.success) {
        router.push('/');
        router.refresh();
        return { success: true };
      } else {
        setError(result.error || 'Error al iniciar sesión');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (
    email: string, 
    password: string, 
    displayName: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await registerWithEmail(email, password, displayName);
      if (result.success) {
        return { 
          success: true, 
          message: 'Registro exitoso. Por favor verifica tu email.' 
        };
      } else {
        setError(result.error || 'Error al registrar usuario');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        router.push('/');
        router.refresh();
        return { success: true };
      } else {
        setError(result.error || 'Error con Google');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await logoutUser();
      if (result.success) {
        router.push('/');
        router.refresh();
        return { success: true };
      } else {
        setError(result.error || 'Error al cerrar sesión');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [router]);

  const updateProfile = useCallback(async (uid: string, updates: any) => {
    setLoading(true);
    
    try {
      const result = await updateUserProfile(uid, updates);
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Error al actualizar perfil');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    login,
    register,
    googleLogin,
    logout,
    updateProfile
  };
};