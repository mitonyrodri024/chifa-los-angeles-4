'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Añadir useSearchParams
import { useAuth } from '@/lib/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/buttons';
import { validateEmail, validatePassword, validateName, validatePasswordMatch } from '@/lib/utils/validation';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Obtener parámetros de la URL
  const { login, register, googleLogin, error: authError } = useAuth();
  
  // Obtener la URL de redirección de los query params
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log para debugging
  useEffect(() => {
    console.log('🔀 URL de redirección:', redirectUrl);
  }, [redirectUrl]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    if (mode === 'register') {
      newErrors.displayName = validateName(formData.displayName);
      newErrors.confirmPassword = validatePasswordMatch(
        formData.password, 
        formData.confirmPassword
      );
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value)
    );
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          // Redirigir a la URL guardada o al home
          console.log('🔀 Redirigiendo a:', redirectUrl);
          router.push(redirectUrl);
          router.refresh();
        }
      } else {
        const result = await register(formData.email, formData.password, formData.displayName);
        if (result.success) {
          alert('¡Registro exitoso! Por favor verifica tu email antes de iniciar sesión.');
          // IMPORTANTE: Después del registro, redirigir al login pero guardando 
          // la URL original para redirigir después del login
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        console.log('🔀 Redirigiendo a:', redirectUrl);
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {(authError || Object.keys(errors).length > 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {authError && <p className="text-red-600 text-sm">{authError}</p>}
          {Object.values(errors).map((error, index) => (
            <p key={index} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <Input
            label="Nombre completo"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            error={errors.displayName}
            placeholder="Tu nombre"
            required
          />
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="tu@email.com"
          required
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
          showPasswordToggle
        />

        {mode === 'register' && (
          <Input
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
            showPasswordToggle
          />
        )}

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          fullWidth
          className="mt-2"
        >
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continuar con</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          loading={isSubmitting}
          fullWidth
          className="mt-4"
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </Button>
      </div>
    </div>
  );
}