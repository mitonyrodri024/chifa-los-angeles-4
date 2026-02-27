'use client';

import { useState } from 'react';
import { 
  Home, 
  Package, 
  Tag, 
  Users, 
  ShoppingBag, 
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/contexts/AuthContext';

export default function AdminPanel() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: 'Platos Totales', value: '24', icon: Package, change: '+2 este mes', color: 'blue' },
    { label: 'Categoridos ías', value: '6', icon: Tag, change: '+1 este mes', color: 'green' },
    { label: 'PedHoy', value: '18', icon: ShoppingBag, change: '+5 vs ayer', color: 'purple' },
    { label: 'Usuarios', value: '156', icon: Users, change: '+12 este mes', color: 'yellow' },
  ];

  const recentOrders = [
    { id: '#001', customer: 'Juan Pérez', total: 85.90, status: 'Completado', time: '10:30 AM' },
    { id: '#002', customer: 'María García', total: 45.50, status: 'En preparación', time: '11:15 AM' },
    { id: '#003', customer: 'Carlos López', total: 62.00, status: 'Pendiente', time: '11:45 AM' },
    { id: '#004', customer: 'Ana Martínez', total: 120.00, status: 'En delivery', time: '12:20 PM' },
  ];

  const lowStockItems = [
    { name: 'Salsa de Ostras', stock: 3, min: 10 },
    { name: 'Fideos de Arroz', stock: 5, min: 15 },
    { name: 'Wantanes', stock: 8, min: 20 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-chifa-red to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-red-100">
                  Bienvenido, {user?.displayName || 'Administrador'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Volver al Menú
              </Link>
              <div className="text-right">
                <div className="text-sm text-red-200">Rol</div>
                <div className="font-bold">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-chifa-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </button>
                
                <button
                  onClick={() => setActiveTab('dishes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dishes'
                      ? 'bg-chifa-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Gestión de Platos
                </button>
                
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-chifa-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                  Gestión de Categorías
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-chifa-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Pedidos
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-chifa-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-chifa-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Configuración
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/admin/dishes/add"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-chifa-yellow text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Plato
                </Link>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          stat.color === 'green' ? 'bg-green-100 text-green-600' :
                          stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-green-600">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pedidos Recientes y Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pedidos Recientes */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
                      <Link
                        href="/admin/orders"
                        className="text-sm text-chifa-red hover:text-red-700 font-medium"
                      >
                        Ver todos →
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div>
                            <div className="font-medium text-gray-900">{order.id} • {order.customer}</div>
                            <div className="text-sm text-gray-500">{order.time}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">S/ {order.total.toFixed(2)}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                              order.status === 'Completado' ? 'bg-green-100 text-green-800' :
                              order.status === 'En preparación' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'En delivery' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock Bajo */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Stock Bajo</h2>
                      <button className="text-sm text-chifa-red hover:text-red-700 font-medium">
                        Reabastecer →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {lowStockItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              Mínimo recomendado: {item.min} unidades
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              item.stock < 5 ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {item.stock} unidades
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.stock < 5 ? '¡CRÍTICO!' : 'Bajo stock'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                      href="/admin/dishes/add"
                      className="p-4 border border-gray-200 rounded-lg hover:border-chifa-red hover:bg-red-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200">
                          <Plus className="w-5 h-5 text-chifa-red" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Agregar Plato</div>
                          <div className="text-sm text-gray-500">Nuevo plato al menú</div>
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/admin/categories"
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                          <Tag className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Gestionar Categorías</div>
                          <div className="text-sm text-gray-500">Organizar categorías</div>
                        </div>
                      </div>
                    </Link>

                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group text-left">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                          <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Vista Previa</div>
                          <div className="text-sm text-gray-500">Ver como cliente</div>
                        </div>
                      </div>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group text-left">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                          <Settings className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Configuración</div>
                          <div className="text-sm text-gray-500">Ajustes del sistema</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Otras pestañas (simplificadas) */}
            {activeTab !== 'dashboard' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeTab === 'dishes' && 'Gestión de Platos'}
                  {activeTab === 'categories' && 'Gestión de Categorías'}
                  {activeTab === 'orders' && 'Pedidos'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Configuración'}
                </h2>
                <p className="text-gray-600 mb-6">
                  Esta sección está en desarrollo. Pronto estarán disponibles todas las funcionalidades.
                </p>
                
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚧</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">En Construcción</h3>
                  <p className="text-gray-500">
                    Estamos trabajando en esta sección. Estará disponible próximamente.
                  </p>
                  <div className="mt-4">
                    <Link
                      href={activeTab === 'dishes' ? '/admin/dishes/add' : 
                            activeTab === 'categories' ? '/admin/categories' : '#'}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-chifa-red text-white rounded-lg hover:bg-red-700"
                    >
                      {activeTab === 'dishes' ? (
                        <>
                          <Plus className="w-4 h-4" />
                          Ir a Agregar Plato
                        </>
                      ) : activeTab === 'categories' ? (
                        <>
                          <Tag className="w-4 h-4" />
                          Ver Categorías
                        </>
                      ) : (
                        'Volver al Dashboard'
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}