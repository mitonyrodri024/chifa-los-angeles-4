// src/app/admin/categories/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import CategoryForm from '@/components/admin/CategoryForm';
import { categoryService } from '@/lib/firebase/categoryService';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types/menu.types';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
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
          setCategory(foundCategory);
        } else {
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

  const handleSubmit = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'dishCount'>) => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const dataToSend = {
        name: categoryData.name.trim(),
        description: categoryData.description || '',
        isActive: categoryData.isActive,
        icon: categoryData.icon || '🍽️',
        color: categoryData.color || '#EC1F25',
        order: categoryData.order || 1,
        images: categoryData.images || [],
        specialOptions: categoryData.specialOptions || []
      };
      
      const success = await categoryService.updateCategory(categoryId, dataToSend);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/categories');
          router.refresh();
        }, 2000);
      } else {
        setError('Error al actualizar la categoría');
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message || 'Error al actualizar la categoría');
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
            <Loader2 className="w-16 h-16 text-[#EC1F25] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando información de la categoría...</p>
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
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
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
              <Link
                href="/admin/categories"
                className="px-6 py-3 bg-[#EC1F25] text-white font-semibold rounded-lg hover:bg-red-700"
              >
                Volver a Categorías
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/admin/categories"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Categoría</h1>
                <p className="text-gray-600">Modifica la información de la categoría</p>
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">¡Categoría actualizada exitosamente!</h3>
                  <p className="text-green-700">Redirigiendo...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {category && (
            <CategoryForm
              category={category}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSaving}
              isEditing={true}
            />
          )}
        </div>
      </div>
    </ProtectedAdmin>
  );
}