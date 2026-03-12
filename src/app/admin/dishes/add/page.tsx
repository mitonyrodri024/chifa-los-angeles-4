'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import DishForm from '@/components/admin/DishForm';
import { categoryService } from '@/lib/firebase/categoryService';
import { dishService } from '@/lib/firebase/dishService';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddDishPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalDishes, setTotalDishes] = useState(0);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingCategories(true);

        // Cargar categorías
        const categoriesData = await categoryService.getAllCategories();
        console.log('📁 Categorías cargadas:', categoriesData);
        setCategories(categoriesData);

        // Cargar conteo de platos
        const dishesData = await dishService.getAllDishes();
        setTotalDishes(dishesData.length);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar datos iniciales');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (dishData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📝 Datos del plato recibidos:', dishData);

      if (!dishData.categoryId) {
        throw new Error('Debes seleccionar una categoría');
      }

      const selectedCategory = categories.find(c => c.id === dishData.categoryId);
      if (!selectedCategory) {
        throw new Error('Categoría seleccionada no encontrada');
      }

      // 🔥 VERIFICAR: Si la categoría tiene opciones especiales, forzar dishType = 'normal'
      const hasSpecialOptions = selectedCategory.specialOptions && selectedCategory.specialOptions.length > 0;
      const finalDishType = hasSpecialOptions ? 'normal' : (dishData.dishType || 'normal');

      console.log('🔍 Verificación de categoría:', {
        categoryName: selectedCategory.name,
        hasSpecialOptions,
        dishTypeRecibido: dishData.dishType,
        finalDishType
      });

      // Preparar datos para guardar
      const dishToSave = {
        name: dishData.name.trim(),
        description: dishData.description.trim(),
        price: Number(dishData.price) || 0,
        image: '', // string vacío
        categoryId: dishData.categoryId,
        categoryName: selectedCategory.name,
        isAvailable: dishData.isAvailable ?? true,
        isVegetarian: dishData.isVegetarian ?? false,
        isSpicy: dishData.isSpicy ?? false,
        preparationTime: Number(dishData.preparationTime) || 15,
        ingredients: Array.isArray(dishData.ingredients)
          ? dishData.ingredients
          : (typeof dishData.ingredients === 'string' && dishData.ingredients
            ? dishData.ingredients.split(',').map((i: string) => i.trim()).filter((i: string) => i)
            : []),
        dishType: finalDishType, // ← USAR EL VALOR CORREGIDO
      };

      console.log('💾 Guardando plato:', dishToSave);

      const newDish = await dishService.addDish(dishToSave);

      if (newDish) {
        console.log('✅ Plato agregado exitosamente:', newDish);
        setShowSuccess(true);
        setTotalDishes(prev => prev + 1);

        setTimeout(() => {
          router.push('/admin/dishes');
        }, 2000);
      } else {
        throw new Error('Error al agregar el plato');
      }

    } catch (error: any) {
      console.error('❌ Error al agregar plato:', error);
      setError(error.message || 'Error al agregar el plato. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/dishes');
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
                  href="/admin/dishes"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Agregar Nuevo Plato
                  </h1>
                  <p className="text-gray-600">
                    Completa el formulario para agregar un nuevo plato al menú
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Total de platos</div>
                <div className="text-2xl font-bold text-[#EC1F25]">
                  {totalDishes}
                </div>
              </div>
            </div>

            {/* Indicadores */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Categorías disponibles</div>
                <div className="text-lg font-bold text-blue-800">
                  {isLoadingCategories ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    categories.filter(c => c.isActive).length
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">¡Plato agregado exitosamente!</h3>
                  <p className="text-green-700">
                    Redirigiendo a la lista de platos...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cargando categorías */}
          {isLoadingCategories ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#EC1F25] animate-spin mb-4" />
              <p className="text-gray-600">Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📂</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay categorías disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                Primero debes crear al menos una categoría para poder agregar platos.
              </p>
              <Link
                href="/admin/categories"
                className="px-6 py-3 bg-[#FBBF24] text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors inline-flex items-center gap-2"
              >
                Ir a Gestionar Categorías
              </Link>
            </div>
          ) : (
            <>
              {/* Formulario */}
              <DishForm
                categories={categories.filter(c => c.isActive)}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />

              {/* Información útil */}
              <div className="mt-8 p-6 bg-white rounded-xl shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📝 Consejos para agregar platos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm">1</span>
                      </div>
                      <p className="text-gray-600">
                        Asegúrate de seleccionar una categoría para organizar mejor tu menú.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm">2</span>
                      </div>
                      <p className="text-gray-600">
                        Describe bien los ingredientes para que los clientes sepan qué contiene.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm">3</span>
                      </div>
                      <p className="text-gray-600">
                        Incluye precios competitivos y tiempos de preparación realistas.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm">4</span>
                      </div>
                      <p className="text-gray-600">
                        Marca como vegetariano o picante para ayudar a los clientes con preferencias.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
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