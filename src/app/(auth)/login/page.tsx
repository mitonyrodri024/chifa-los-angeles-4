import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chifa Los Angeles
          </h1>

          <p className="text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Auth Form con Suspense */}
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        }>
          <AuthForm mode="login" />
        </Suspense>

        {/* Additional Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-red-600 hover:text-red-700 font-medium underline"
            >
              Regístrate aquí
            </Link>
          </p>

          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}