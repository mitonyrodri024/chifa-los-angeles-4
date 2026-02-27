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

  const stats = [
    { icon: ShoppingBag, label: 'Pedidos', value: '12', color: 'blue' },
    { icon: Star, label: 'Puntos', value: '850', color: 'yellow' },
    { icon: CreditCard, label: 'Gastado', value: 'S/ 480', color: 'green' }
  ];

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

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {stats.map((stat, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                          <div className={`w-12 h-12 rounded-full ${stat.color === 'blue' ? 'bg-blue-100' : stat.color === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'} flex items-center justify-center mx-auto mb-2`}>
                            <stat.icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`} />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
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

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Pedidos Recientes
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">Orden #100{order}</p>
                        <p className="text-sm text-gray-600">Chaufa Especial, Wantán Frito</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">S/ {25 + order * 5}.00</p>
                        <p className="text-sm text-gray-600">Hace {order} día{order > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="mt-6"
                  onClick={() => router.push('/orders')}
                >
                  Ver Todos los Pedidos
                </Button>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
                <div className="space-y-4">
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => router.push('/menu')}
                  >
                    Hacer Pedido
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth
                    onClick={() => router.push('/orders')}
                  >
                    Mis Pedidos
                  </Button>
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