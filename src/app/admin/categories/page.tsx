// app/admin/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import CategoryForm from '@/components/admin/CategoryForm';
import { Category } from '@/types/menu.types';
import { categoryService } from '@/lib/firebase/categoryService';
import { dishService } from '@/lib/services/dishService';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Check, X, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// Interface para categoría con conteo de platos
interface CategoryWithDishCount extends Category {
  dishCount: number;
}

// Tipo para datos del formulario (lo que espera el servicio)
type CategoryFormData = Omit<Category, 'id' | 'dishCount' | 'createdAt' | 'updatedAt'>;

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithDishCount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCategories = async () => {
    try {
      setIsRefreshing(true);
      // Obtener categorías desde Firebase
      const fetchedCategories = await categoryService.getAllCategories();

      // Obtener platos para contar por categoría
      const allDishes = await dishService.getAllDishes();

      // Contar platos por categoría
      const categoriesWithCount = fetchedCategories.map(category => {
        const dishCount = allDishes.filter(dish => dish.categoryId === category.id).length;
        return {
          ...category,
          dishCount
        };
      });

      // Ordenar por order
      categoriesWithCount.sort((a, b) => (a.order || 0) - (b.order || 0));

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar las categorías');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (categoryData: CategoryFormData) => {
    setIsLoading(true);

    try {
      // Preparar los datos asegurando que todos los campos tengan valor
      const dataToSend: CategoryFormData = {
        name: categoryData.name.trim(),
        description: categoryData.description || '',
        isActive: categoryData.isActive,
        icon: categoryData.icon || '🍽️',
        color: categoryData.color || '#DC2626',
        order: categoryData.order || 1
      };

      if (editingCategory) {
        // Para actualizar, usamos Partial<Category> que acepta campos opcionales
        const updateData: Partial<Category> = dataToSend;
        const success = await categoryService.updateCategory(editingCategory.id, updateData);
        
        if (!success) {
          throw new Error('Error al actualizar la categoría');
        }
        
        alert('Categoría actualizada exitosamente');
      } else {
        // Para crear nueva categoría
        const newCategory = await categoryService.addCategory(dataToSend);
        
        if (!newCategory) {
          throw new Error('Error al crear la categoría');
        }
        
        alert('Categoría creada exitosamente');
      }

      // Recargar la lista de categorías
      await loadCategories();
      
      // Cerrar el formulario
      setShowForm(false);
      setEditingCategory(null);

    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
      alert(error.message || 'Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: CategoryWithDishCount) => {
    if (category.dishCount > 0) {
      alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.dishCount} plato(s) asociado(s). Primero mueve o elimina los platos.`);
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      try {
        const result = await categoryService.deleteCategory(category.id);
        if (result.success) {
          await loadCategories();
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (error: any) {
        alert('Error al eliminar la categoría: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const success = await categoryService.toggleCategoryStatus(category.id);
      if (success) {
        await loadCategories();
        alert(`Categoría ${category.isActive ? 'desactivada' : 'activada'} exitosamente`);
      }
    } catch (error: any) {
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const handleReorder = async (direction: 'up' | 'down', index: number) => {
    if (showReorder) {
      const newCategories = [...categories];

      if (direction === 'up' && index > 0) {
        [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
      } else if (direction === 'down' && index < newCategories.length - 1) {
        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      }

      // Actualizar órdenes en Firebase
      const orderedIds = newCategories.map(cat => cat.id);
      const success = await categoryService.reorderCategories(orderedIds);

      if (success) {
        await loadCategories();
      } else {
        alert('Error al reordenar las categorías');
      }
    }
  };

  const handleSaveOrder = () => {
    setShowReorder(false);
    alert('Orden guardado exitosamente');
  };

  return (
    <ProtectedAdmin>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestión de Categorías
                  </h1>
                  <p className="text-gray-600">
                    Organiza las categorías de tu menú
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadCategories}
                  disabled={isRefreshing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </button>

                <button
                  onClick={() => setShowReorder(!showReorder)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  {showReorder ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancelar orden
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Reordenar
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-chifa-yellow text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Categoría
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Total de categorías</div>
                <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Categorías activas</div>
                <div className="text-2xl font-bold text-green-600">
                  {categories.filter(c => c.isActive).length}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Platos totales</div>
                <div className="text-2xl font-bold text-blue-600">
                  {categories.reduce((sum, cat) => sum + cat.dishCount, 0)}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Sin platos</div>
                <div className="text-2xl font-bold text-orange-600">
                  {categories.filter(c => c.dishCount === 0).length}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario (modal) */}
          {showForm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CategoryForm
                  category={editingCategory}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Lista de categorías */}
          {!showForm && (
            <div className="space-y-4">
              {showReorder && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <ChevronUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Modo reordenar activado</h3>
                        <p className="text-blue-700 text-sm">
                          Arrastra las categorías o usa los botones para cambiar el orden de visualización
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveOrder}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Guardar orden
                    </button>
                  </div>
                </div>
              )}

              {categories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📂</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay categorías
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comienza creando tu primera categoría para organizar tu menú.
                  </p>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setShowForm(true);
                    }}
                    className="px-6 py-3 bg-chifa-yellow text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primera Categoría
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Header con color */}
                      <div
                        className="h-3"
                        style={{ backgroundColor: category.color || '#DC2626' }}
                      ></div>

                      <div className="p-5">
                        {/* Info de categoría */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                              style={{ backgroundColor: `${category.color || '#DC2626'}20` }}
                            >
                              {category.icon || '🍽️'}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900" style={{ color: category.color || '#DC2626' }}>
                                {category.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${category.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {category.isActive ? 'Activa' : 'Inactiva'}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                                  Orden: {category.order || index + 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contador de platos */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {category.dishCount}
                            </div>
                            <div className="text-xs text-gray-500">
                              {category.dishCount === 1 ? 'plato' : 'platos'}
                            </div>
                          </div>
                        </div>

                        {/* Descripción */}
                        {category.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {category.description}
                          </p>
                        )}

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          {showReorder ? (
                            <>
                              <button
                                onClick={() => handleReorder('up', index)}
                                disabled={index === 0}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${index === 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }`}
                              >
                                <ChevronUp className="w-4 h-4" />
                                Subir
                              </button>
                              <button
                                onClick={() => handleReorder('down', index)}
                                disabled={index === categories.length - 1}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${index === categories.length - 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }`}
                              >
                                <ChevronDown className="w-4 h-4" />
                                Bajar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(category)}
                                className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleToggleStatus(category)}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${category.isActive
                                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                                  }`}
                              >
                                {category.isActive ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Activar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                disabled={category.dishCount > 0}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${category.dishCount > 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                                  }`}
                                title={category.dishCount > 0 ? 'No se puede eliminar: tiene platos asociados' : ''}
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Información */}
          {!showForm && categories.length > 0 && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Consejos para organizar categorías
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Orden lógico</h4>
                      <p className="text-gray-600 text-sm">
                        Organiza las categorías en el orden en que los clientes esperan verlas (entradas, platos principales, postres).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Colores distintivos</h4>
                      <p className="text-gray-600 text-sm">
                        Usa diferentes colores para cada categoría para facilitar la identificación visual.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Iconos representativos</h4>
                      <p className="text-gray-600 text-sm">
                        Usa emojis o iconos que representen claramente el tipo de platos en cada categoría.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Desactivar temporalmente</h4>
                      <p className="text-gray-600 text-sm">
                        Desactiva categorías que temporalmente no tienen platos disponibles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </ProtectedAdmin>
  );
}