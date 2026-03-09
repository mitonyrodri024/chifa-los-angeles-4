'use client';

import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/buttons';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { 
  ShoppingBag, 
  Star, 
  CreditCard,
  LogOut,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (profileLoading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner fullScreen message="Cargando perfil..." />
      </ProtectedRoute>
    );
  }

 

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Bienvenido de vuelta, {user?.displayName}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 h-32"></div>
                <div className="px-8 pb-8 relative">
                  <div className="absolute -top-16">
                    <ProfileAvatar user={user!} size="lg" />
                  </div>
                  
                  <div className="pt-20">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.displayName}</h2>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                            user?.emailVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user?.emailVerified ? '✓ Verificado' : '✗ No verificado'}
                          </div>
                          <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <Shield className="w-4 h-4 mr-1" />
                            {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/profile/edit')}
                        className="flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                    

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                      </div>

                      {profile?.phoneNumber && (
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="text-gray-900">{profile.phoneNumber}</p>
                          </div>
                        </div>
                      )}

                      {(profile?.address || profile?.city) && (
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Dirección</p>
                            <p className="text-gray-900">
                              {profile.address} {profile.city && `, ${profile.city}`}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Miembro desde</p>
                          <p className="text-gray-900">
                            {new Date(profile?.createdAt || user?.createdAt || Date.now()).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
                <div className="space-y-4">
                  
                  <Button 
                    variant="outline" 
                    fullWidth
                    onClick={() => router.push('/profile/edit')}
                  >
                    Editar Perfil
                  </Button>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="danger"
                fullWidth
                onClick={handleLogout}
                className="flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}