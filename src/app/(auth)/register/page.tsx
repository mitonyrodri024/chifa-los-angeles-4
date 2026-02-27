import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Cuenta
            </h1>

            <p className="text-gray-600">
              Únete a nuestra comunidad de amantes del buen Chifa
            </p>
          </div>

          <AuthForm mode="register" />

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="text-red-600 hover:text-red-700 font-medium underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
