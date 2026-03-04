'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import { categoryService } from '@/lib/firebase/categoryService';
import { dishService } from '@/lib/firebase/dishService';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, 
  Search, Filter, Loader2, AlertCircle, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  preparationTime?: number;
  ingredients?: string[];
}

export default function AdminDishesPage() {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [dishesData, categoriesData] = await Promise.all([
          dishService.getAllDishes(),
          categoryService.getAllCategories()
        ]);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los platos');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrar platos
  const filteredDishes = dishes.filter(dish => {
    // Filtro por búsqueda
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría
    const matchesCategory = selectedCategory === 'all' || dish.categoryId === selectedCategory;
    
    // Filtro por disponibilidad
    const matchesAvailability = !showAvailableOnly || dish.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Ordenar por nombre
  const sortedDishes = [...filteredDishes].sort((a, b) => a.name.localeCompare(b.name));

  // Eliminar plato
  const handleDelete = async (dishId: string) => {
    setIsDeleting(true);
    try {
      const success = await dishService.deleteDish(dishId);
      if (success) {
        setDishes(dishes.filter(d => d.id !== dishId));
        setSuccessMessage('Plato eliminado correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Error al eliminar el plato');
      }
    } catch (error) {
      setError('Error al eliminar el plato');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Cambiar disponibilidad
  const handleToggleAvailability = async (dish: Dish) => {
    try {
      const updated = await dishService.updateDish(dish.id, {
        isAvailable: !dish.isAvailable
      });
      if (updated) {
        setDishes(dishes.map(d => 
          d.id === dish.id ? { ...d, isAvailable: !d.isAvailable } : d
        ));
        setSuccessMessage(`Plato ${dish.isAvailable ? 'desactivado' : 'activado'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      setError('Error al cambiar disponibilidad');
    }
  };

  return (
    <ProtectedAdmin>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestión de Platos
                  </h1>
                  <p className="text-gray-600">
                    Administra todos los platos del menú
                  </p>
                </div>
              </div>
              
              <Link
                href="/admin/dishes/add"
                className="px-4 py-2 bg-[#F59E0B] hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nuevo Plato
              </Link>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm text-gray-500">Total platos</div>
                <div className="text-2xl font-bold text-gray-900">{dishes.length}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm text-gray-500">Disponibles</div>
                <div className="text-2xl font-bold text-green-600">
                  {dishes.filter(d => d.isAvailable).length}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm text-gray-500">Vegetarianos</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {dishes.filter(d => d.isVegetarian).length}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm text-gray-500">Picantes</div>
                <div className="text-2xl font-bold text-red-600">
                  {dishes.filter(d => d.isSpicy).length}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar plato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent"
                  />
                </div>

                {/* Filtro por categoría */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({dishes.filter(d => d.categoryId === cat.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro disponibilidad */}
                <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-[#EC1F25] rounded focus:ring-[#EC1F25]"
                  />
                  <span className="text-sm text-gray-700">Solo disponibles</span>
                </label>

                {/* Resultados */}
                <div className="flex items-center justify-end text-sm text-gray-500">
                  {sortedDishes.length} {sortedDishes.length === 1 ? 'plato' : 'platos'} encontrados
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#EC1F25] animate-spin mb-4" />
              <p className="text-gray-600">Cargando platos...</p>
            </div>
          ) : sortedDishes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay platos para mostrar
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Intenta con otros filtros' 
                  : 'Comienza agregando tu primer plato'}
              </p>
              {(searchTerm || selectedCategory !== 'all') ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setShowAvailableOnly(false);
                  }}
                  className="px-6 py-3 bg-[#EC1F25] text-white font-semibold rounded-lg hover:bg-[#d41a1f] transition-colors"
                >
                  Limpiar filtros
                </button>
              ) : (
                <Link
                  href="/admin/dishes/add"
                  className="px-6 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Primer Plato
                </Link>
              )}
            </div>
          ) : (
            /* TABLA DE PLATOS */
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Plato
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tiempo
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedDishes.map((dish) => (
                      <tr key={dish.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {dish.name}
                              {dish.isVegetarian && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Veg</span>
                              )}
                              {dish.isSpicy && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Picante</span>
                              )}
                            </div>
                            {dish.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {dish.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {dish.categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#EC1F25]">
                            S/ {dish.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleAvailability(dish)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              dish.isAvailable
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {dish.isAvailable ? (
                              <>
                                <Eye className="w-3 h-3" />
                                Disponible
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                No disponible
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {dish.preparationTime && (
                            <span className="text-sm text-gray-600">
                              {dish.preparationTime} min
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/dishes/edit/${dish.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar plato"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(dish.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar plato"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Modal de confirmación para eliminar */}
                          {deleteConfirm === dish.id && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                  <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                  ¿Eliminar plato?
                                </h3>
                                <p className="text-gray-600 text-center mb-6">
                                  ¿Estás seguro de eliminar <span className="font-bold">"{dish.name}"</span>?
                                </p>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                                    disabled={isDeleting}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleDelete(dish.id)}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </ProtectedAdmin>
  );
}