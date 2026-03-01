'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import DishForm from '@/components/admin/DishForm';
import { categoryService } from '@/lib/firebase/categoryService';
import { dishService } from '@/lib/firebase/dishService';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditDishPage() {
  const router = useRouter();
  const params = useParams();
  const dishId = params.id as string;

  const [dish, setDish] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cargar datos del plato y categorías
  useEffect(() => {
    const loadData = async () => {
      if (!dishId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Cargando datos para editar plato:', dishId);
        
        // Cargar categorías y plato en paralelo para mayor eficiencia
        const [categoriesData, dishData] = await Promise.all([
          categoryService.getAllCategories(),
          dishService.getDishById(dishId)
        ]);
        
        setCategories(categoriesData || []);
        
        if (dishData) {
          console.log('✅ Plato cargado:', dishData);
          setDish(dishData);
        } else {
          setError('No se encontró el plato');
          setTimeout(() => router.push('/'), 2000);
        }
        
      } catch (error: any) {
        console.error('❌ Error al cargar datos:', error);
        setError('Error al cargar los datos del plato');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dishId, router]);

  const handleSubmit = async (dishData: any) => {
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('📝 Actualizando plato:', dishId, dishData);
      
      // Validaciones
      if (!dishData.categoryId) {
        throw new Error('Debes seleccionar una categoría');
      }
      
      const selectedCategory = categories.find(c => c.id === dishData.categoryId);
      if (!selectedCategory) {
        throw new Error('Categoría seleccionada no encontrada');
      }
      
      if (!dishData.name?.trim()) {
        throw new Error('El nombre del plato es obligatorio');
      }
      
      if (!dishData.price || dishData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      
      // Preparar datos para actualizar
      const dishToUpdate = {
        ...dishData,
        name: dishData.name.trim(),
        description: dishData.description?.trim() || '',
        categoryName: selectedCategory.name,
        updatedAt: new Date(),
      };
      
      const success = await dishService.updateDish(dishId, dishToUpdate);
      
      if (success) {
        console.log('✅ Plato actualizado exitosamente');
        setShowSuccess(true);
        
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        throw new Error('Error al actualizar el plato');
      }
      
    } catch (error: any) {
      console.error('❌ Error al actualizar plato:', error);
      setError(error.message || 'Error al actualizar el plato. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando plato:', dishId);
      
      const success = await dishService.deleteDish(dishId);
      
      if (success) {
        console.log('✅ Plato eliminado exitosamente');
        router.push('/');
      } else {
        throw new Error('Error al eliminar el plato');
      }
      
    } catch (error: any) {
      console.error('❌ Error al eliminar plato:', error);
      setError(error.message || 'Error al eliminar el plato');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedAdmin>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#EC1F25] animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Cargando datos del plato...</p>
          </div>
        </div>
      </ProtectedAdmin>
    );
  }

  // Error state (sin plato)
  if (error && !dish) {
    return (
      <ProtectedAdmin>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow border border-red-200 p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/"
                className="px-6 py-3 bg-[#EC1F25] text-white font-semibold rounded-lg hover:bg-[#d41a1f] transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Menú
              </Link>
            </div>
          </div>
        </div>
      </ProtectedAdmin>
    );
  }

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
                    Editar Plato
                  </h1>
                  <p className="text-gray-600">
                    Modifica los datos del plato <span className="font-semibold text-[#EC1F25]">"{dish?.name}"</span>
                  </p>
                </div>
              </div>
              
              {/* Botón eliminar */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2 shadow-md hover:shadow-lg"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar Plato
              </button>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#EC1F25] transition-colors">
                Inicio
              </Link>
              <span>›</span>
              <span className="text-gray-900">Editar Plato</span>
            </div>
          </div>

          {/* Mensajes */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-slideDown">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">¡Plato actualizado exitosamente!</h3>
                  <p className="text-green-700">
                    Redirigiendo al menú principal...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slideDown">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación eliminar */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  ¿Eliminar plato?
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  ¿Estás seguro de eliminar <span className="font-bold text-gray-900">"{dish?.name}"</span>?<br />
                  Esta acción <span className="text-red-600 font-semibold">no se puede deshacer</span>.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all hover:scale-105"
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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

          {/* Formulario */}
          {dish && (
            <div className="animate-slideUp">
              <DishForm
                dish={dish}
                categories={categories.filter(c => c.isActive)}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSaving}
                isEditing={true}
              />
            </div>
          )}

          {/* Información útil */}
          <div className="mt-8 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Consejos para editar platos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Precios:</span> Mantén los precios actualizados según los costos actuales.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Disponibilidad:</span> Actualiza si un plato está agotado temporalmente.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Ingredientes:</span> Revisa que estén correctos y completos.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Imagen:</span> Usa fotos atractivas y de buena calidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
          }
          
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </ProtectedAdmin>
  );
}