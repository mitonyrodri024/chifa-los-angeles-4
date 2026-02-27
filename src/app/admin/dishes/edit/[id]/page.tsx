'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import CategoryForm from '@/components/admin/CategoryForm';
import { categoryService } from '@/lib/firebase/categoryService';
import { dishService } from '@/lib/firebase/dishService';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Check, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar categorías
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await categoryService.getCategoriesWithCount();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (categoryData: any) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result;
      
      if (editingCategory) {
        // Actualizar categoría
        result = await categoryService.updateCategory(editingCategory.id, categoryData);
        if (result) {
          setSuccess('Categoría actualizada exitosamente');
        } else {
          setError('Error al actualizar categoría');
        }
      } else {
        // Crear nueva categoría
        result = await categoryService.addCategory(categoryData);
        if (result) {
          setSuccess('Categoría creada exitosamente');
        } else {
          setError('Error al crear categoría');
        }
      }
      
      if (result) {
        await loadCategories();
        setTimeout(() => {
          setShowForm(false);
          setEditingCategory(null);
          setSuccess(null);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
      setError(error.message || 'Error al guardar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setError(null);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: any) => {
    if (category.dishCount > 0) {
      alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.dishCount} plato(s) asociado(s). Primero mueve o elimina los platos.`);
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      const result = await categoryService.deleteCategory(category.id);
      if (result.success) {
        await loadCategories();
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  const handleToggleStatus = async (category: any) => {
    const success = await categoryService.toggleCategoryStatus(category.id);
    if (success) {
      await loadCategories();
    }
  };

  const handleReorder = async (direction: 'up' | 'down', index: number) => {
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
    }
  };

  const handleSaveOrder = async () => {
    const orderedIds = categories.map(cat => cat.id);
    const success = await categoryService.reorderCategories(orderedIds);
    
    if (success) {
      setSuccess('Orden guardado exitosamente');
      setTimeout(() => setSuccess(null), 2000);
      setShowReorder(false);
    } else {
      setError('Error al guardar el orden');
    }
  };

  // Estadísticas
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    totalDishes: categories.reduce((sum, cat) => sum + cat.dishCount, 0),
    empty: categories.filter(c => c.dishCount === 0).length,
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
                  onClick={() => setShowReorder(!showReorder)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  Nueva Categoría
                </button>
              </div>
            </div>

            {/* Mensajes */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Total de categorías</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Categorías activas</div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Platos totales</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalDishes}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Sin platos</div>
                <div className="text-2xl font-bold text-orange-600">{stats.empty}</div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && !showForm && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-chifa-red animate-spin mb-4" />
              <p className="text-gray-600">Cargando categorías...</p>
            </div>
          )}

          {/* Formulario (modal) */}
          {showForm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CategoryForm
                  category={editingCategory}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}

          {/* Lista de categorías */}
          {!isLoading && !showForm && (
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
                          Usa los botones para cambiar el orden de visualización
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
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  category.isActive
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
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {category.description}
                          </p>
                        )}

                        {/* Fechas */}
                        <div className="text-xs text-gray-500 mb-4">
                          {category.createdAt && (
                            <div>
                              Creada: {new Date(category.createdAt).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          {showReorder ? (
                            <>
                              <button
                                onClick={() => handleReorder('up', index)}
                                disabled={index === 0}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${
                                  index === 0
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
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${
                                  index === categories.length - 1
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
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${
                                  category.isActive
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
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${
                                  category.dishCount > 0
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
          {!isLoading && !showForm && categories.length > 0 && (
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
                        Usa diferentes colores para cada categoría para facilitar la identificación visual en el menú.
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
                      <h4 className="font-medium text-gray-900">Mantenimiento</h4>
                      <p className="text-gray-600 text-sm">
                        Desactiva categorías vacías y mantén actualizados los contadores de platos.
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