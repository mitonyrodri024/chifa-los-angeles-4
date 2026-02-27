// src/app/admin/categories/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import CategoryForm from '@/components/admin/CategoryForm';
import { categoryService } from '@/lib/firebase/categoryService';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Tipo para datos del formulario
type CategoryFormData = {
  name: string;
  description?: string;
  isActive: boolean;
  icon?: string;
  color?: string;
  order?: number;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Cargando categoría ID:', categoryId);
        const foundCategory = await categoryService.getCategoryById(categoryId);
        
        if (foundCategory) {
          console.log('✅ Categoría encontrada:', foundCategory);
          setCategory(foundCategory);
        } else {
          console.error('❌ Categoría no encontrada:', categoryId);
          setError('Categoría no encontrada');
        }
      } catch (error: any) {
        console.error('❌ Error al cargar categoría:', error);
        setError(`Error al cargar la categoría: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (categoryData: CategoryFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('💾 Guardando cambios para categoría:', categoryId, categoryData);
      
      // Preparar datos para Firebase
      const dataToSend = {
        name: categoryData.name.trim(),
        description: categoryData.description || '',
        isActive: categoryData.isActive,
        icon: categoryData.icon || '🍽️',
        color: categoryData.color || '#DC2626',
        order: categoryData.order || 1
      };

      console.log('📤 Enviando datos a Firebase:', dataToSend);
      
      const success = await categoryService.updateCategory(categoryId, dataToSend);
      
      if (success) {
        console.log('✅ Categoría actualizada exitosamente');
        setSuccess(true);
        
        // Esperar 2 segundos antes de redirigir
        setTimeout(() => {
          router.push('/admin/categories');
          router.refresh(); // Forzar recarga de datos
        }, 2000);
      } else {
        setError('Error al actualizar la categoría en Firebase');
      }
      
    } catch (error: any) {
      console.error('❌ Error al actualizar categoría:', error);
      setError(`Error: ${error.message || 'No se pudo actualizar la categoría'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  if (isLoading) {
    return (
      <ProtectedAdmin>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-chifa-red animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando información de la categoría...</p>
            <p className="text-gray-500 text-sm mt-2">ID: {categoryId}</p>
          </div>
        </div>
      </ProtectedAdmin>
    );
  }

  if (error && !category) {
    return (
      <ProtectedAdmin>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a categorías
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-gray-500 text-sm mb-6">
                ID de categoría: {categoryId}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reintentar
                </button>
                <Link
                  href="/admin/categories"
                  className="px-6 py-3 bg-chifa-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Volver a Categorías
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedAdmin>
    );
  }

  return (
    <ProtectedAdmin>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/admin/categories"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Editar Categoría
                </h1>
                <p className="text-gray-600">
                  Modifica la información de la categoría
                </p>
              </div>
            </div>

            {/* Info actual */}
            {category && (
              <div className="mb-6 p-5 bg-white rounded-xl shadow border border-gray-200">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{ 
                      backgroundColor: `${category.color || '#DC2626'}20`,
                      color: category.color || '#DC2626'
                    }}
                  >
                    {category.icon || '🍽️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                            Orden: {category.order || 1}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                            ID: {categoryId.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {category.dishCount || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.dishCount === 1 ? 'plato' : 'platos'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensajes de estado */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">¡Categoría actualizada exitosamente!</h3>
                  <p className="text-green-700">
                    Los cambios se han guardado en Firebase. Redirigiendo...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Error al guardar</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          {category && (
            <>
              <CategoryForm
                category={category}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSaving}
              />
              
              {/* Información de Firebase */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">ℹ️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Información de Firebase
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>ID de categoría:</strong> {categoryId}</p>
                      <p><strong>Última actualización:</strong> {
                        category.updatedAt 
                          ? new Date(category.updatedAt).toLocaleString() 
                          : 'No disponible'
                      }</p>
                      <p><strong>Creado:</strong> {
                        category.createdAt 
                          ? new Date(category.createdAt).toLocaleDateString() 
                          : 'No disponible'
                      }</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Advertencias */}
          {category?.dishCount > 0 && (
            <div className="mt-8 p-5 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Esta categoría tiene {category.dishCount} {category.dishCount === 1 ? 'plato' : 'platos'} asociado(s)
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Al modificar esta categoría, los cambios se aplicarán a todos los platos que pertenecen a ella.
                    Si necesitas separar los platos, considera crear una nueva categoría y mover los platos allí.
                  </p>
                </div>
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