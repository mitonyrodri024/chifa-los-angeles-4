'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useProfile } from '@/lib/hooks/useProfile';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/buttons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Save, User, Shield, Mail } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { profile, updateProfile, loading } = useProfile();
  
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: profile?.phoneNumber || '',
        address: profile?.address || '',
        city: profile?.city || '',
      });
    }
  }, [user, profile]);

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner fullScreen message="Cargando información..." />
      </ProtectedRoute>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre es requerido';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.phoneNumber && !/^[0-9+\-\s()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Teléfono no válido (mínimo 10 dígitos)';
    }

    if (formData.address && formData.address.length < 5) {
      newErrors.address = 'Dirección muy corta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ form: 'Error al guardar los cambios' });
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
    setSaveSuccess(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al perfil
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="w-8 h-8 mr-3" />
              Editar Perfil
            </h1>
            <p className="text-gray-600 mt-2">
              Actualiza tu información personal
            </p>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-medium flex items-center">
                <Save className="w-5 h-5 mr-2" />
                ¡Cambios guardados exitosamente!
              </p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Info Section */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Información de la Cuenta
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{user?.email}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        {user?.emailVerified ? '✓ Verificado' : 'No verificado'}
                      </span>
                    </div>
                    {!user?.emailVerified && (
                      <p className="mt-2 text-sm text-yellow-600">
                        Tu email no está verificado. Revisa tu bandeja de entrada.
                      </p>
                    )}
                  </div>

                  <Input
                    label="Nombre completo"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    error={errors.displayName}
                    placeholder="Tu nombre completo"
                    required
                    icon="user"
                  />
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Información de Contacto
                </h3>
                
                <div className="space-y-4">
                  <Input
                    label="Teléfono"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber}
                    placeholder="+51 987654321"
                    icon="phone"
                  />

                  <Input
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="Calle, número, departamento"
                    icon="address"
                  />

                  <Input
                    label="Ciudad"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    placeholder="Ej: Lima, Miraflores, Surco"
                    icon="city"
                  />
                </div>
              </div>

              {/* Role Info (Readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cuenta
                </label>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Shield className="w-4 h-4 mr-2" />
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </div>
              </div>

              {/* Form Errors */}
              {errors.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800">{errors.form}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}