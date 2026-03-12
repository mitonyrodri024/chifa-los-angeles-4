// app/admin/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import CategoryForm from '@/components/admin/CategoryForm';
import { Category } from '@/types/menu.types';
import { categoryService } from '@/lib/firebase/categoryService';
import { dishService } from '@/lib/firebase/dishService';
import {
  ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Check, X,
  ChevronUp, ChevronDown, RefreshCw, Image as ImageIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Interface para categoría con conteo de platos
interface CategoryWithDishCount extends Category {
  dishCount: number;
}

// Tipo para datos del formulario
type CategoryFormData = Omit<Category, 'id' | 'dishCount' | 'createdAt' | 'updatedAt'>;

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithDishCount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImageCategory, setSelectedImageCategory] = useState<string | null>(null);

  // Cargar categorías
  const loadCategories = async () => {
    try {
      setIsRefreshing(true);
      const fetchedCategories = await categoryService.getAllCategories();
      const allDishes = await dishService.getAllDishes();

      const categoriesWithCount = fetchedCategories.map(category => ({
        ...category,
        dishCount: allDishes.filter(dish => dish.categoryId === category.id).length
      }));

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

  // Manejar envío del formulario
  // Manejar envío del formulario - VERSIÓN CORREGIDA
  const handleSubmit = async (categoryData: CategoryFormData) => {
    setIsLoading(true);

    try {
      // 🔥 INCLUIR TODOS LOS CAMPOS, ESPECIALMENTE specialOptions
      const dataToSend: CategoryFormData = {
        name: categoryData.name.trim(),
        description: categoryData.description || '',
        isActive: categoryData.isActive,
        icon: categoryData.icon || '🍽️',
        color: categoryData.color || '#DC2626',
        order: categoryData.order || 1,
        images: categoryData.images || [],
        // 👈 AGREGAR SPECIALOPTIONS AQUÍ
        specialOptions: categoryData.specialOptions || []
      };

      console.log('📤 Enviando datos a Firebase:', {
        ...dataToSend,
        specialOptionsCount: dataToSend.specialOptions?.length || 0
      });

      if (editingCategory) {
        const success = await categoryService.updateCategory(editingCategory.id, dataToSend);
        if (!success) throw new Error('Error al actualizar la categoría');
        alert('✅ Categoría actualizada exitosamente');
      } else {
        const newCategory = await categoryService.addCategory(dataToSend);
        if (!newCategory) throw new Error('Error al crear la categoría');
        alert('✅ Categoría creada exitosamente');
      }

      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('❌ Error al guardar categoría:', error);
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
      alert(`No se puede eliminar "${category.name}" porque tiene ${category.dishCount} plato(s) asociado(s)`);
      return;
    }

    if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      try {
        const result = await categoryService.deleteCategory(category.id);
        if (result.success) {
          await loadCategories();
          alert(result.message);
        }
      } catch (error: any) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const success = await categoryService.toggleCategoryStatus(category.id);
      if (success) {
        await loadCategories();
        alert(`✅ Categoría ${category.isActive ? 'desactivada' : 'activada'}`);
      }
    } catch (error: any) {
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const handleReorder = async (direction: 'up' | 'down', index: number) => {
    if (!showReorder) return;

    const newCategories = [...categories];
    if (direction === 'up' && index > 0) {
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
    } else if (direction === 'down' && index < newCategories.length - 1) {
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    } else {
      return;
    }

    const orderedIds = newCategories.map(cat => cat.id);
    const success = await categoryService.reorderCategories(orderedIds);
    if (success) {
      await loadCategories();
    } else {
      alert('Error al reordenar');
    }
  };

  const handleSaveOrder = () => {
    setShowReorder(false);
    alert('✅ Orden guardado');
  };

  // Componente Modal para ver imágenes (MEJORADO)
  const ImageViewerModal = ({
    categoryId,
    onClose
  }: {
    categoryId: string | null;
    onClose: () => void;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const category = categories.find(c => c.id === categoryId);

    // Verificaciones de seguridad
    if (!categoryId || !category) return null;

    const images = category.images || [];
    if (images.length === 0) {
      // Si no hay imágenes, mostrar mensaje
      return (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 mb-6">
                Esta categoría no tiene imágenes
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#EC1F25] text-white rounded-lg hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentImage = images[currentIndex];

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">
                {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visor principal */}
          <div className="relative h-96 bg-gray-900">
            <Image
              src={currentImage}
              alt={`${category.name} - ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))}
                  disabled={currentIndex === images.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="p-4 bg-gray-100 grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${idx === currentIndex ? 'border-[#EC1F25] scale-105' : 'border-transparent hover:scale-105'
                    }`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <Image
                    src={img}
                    alt={`miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Estadísticas
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    totalDishes: categories.reduce((sum, cat) => sum + cat.dishCount, 0),
    empty: categories.filter(c => c.dishCount === 0).length,
    withImages: categories.filter(c => c.images && c.images.length > 0).length
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
                  className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 ${showReorder
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
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
                  className="px-4 py-2 bg-[#FBBF24] text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Categoría
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Activas</div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Platos</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalDishes}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Vacías</div>
                <div className="text-2xl font-bold text-orange-600">{stats.empty}</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-sm font-medium text-gray-500">Con imágenes</div>
                <div className="text-2xl font-bold text-purple-600">{stats.withImages}</div>
              </div>
            </div>
          </div>

          {/* Modal del formulario */}
          {showForm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CategoryForm
                  category={editingCategory}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                  isLoading={isLoading}
                  isEditing={!!editingCategory}
                />
              </div>
            </div>
          )}

          {/* Modal de imágenes */}
          <ImageViewerModal
            categoryId={selectedImageCategory}
            onClose={() => setSelectedImageCategory(null)}
          />

          {/* Lista de categorías */}
          {!showForm && (
            <div className="space-y-4">
              {/* Banner de reordenar */}
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
                          Usa los botones para cambiar el orden
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

              {/* Grid de categorías */}
              {categories.length === 0 ? (
                <EmptyState onAdd={() => {
                  setEditingCategory(null);
                  setShowForm(true);
                }} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, index) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      index={index}
                      showReorder={showReorder}
                      isFirst={index === 0}
                      isLast={index === categories.length - 1}
                      onEdit={() => handleEdit(category)}
                      onDelete={() => handleDelete(category)}
                      onToggleStatus={() => handleToggleStatus(category)}
                      onReorder={(direction) => handleReorder(direction, index)}
                      onViewImages={() => setSelectedImageCategory(category.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consejos */}
          {!showForm && categories.length > 0 && <TipsSection />}
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

// Componente de tarjeta de categoría (MEJORADO PARA MOSTRAR MÚLTIPLES IMÁGENES)
function CategoryCard({
  category,
  index,
  showReorder,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  onViewImages
}: {
  category: CategoryWithDishCount;
  index: number;
  showReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onReorder: (direction: 'up' | 'down') => void;
  onViewImages: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = category.images || [];

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header con color */}
      <div
        className="h-3"
        style={{ backgroundColor: category.color || '#DC2626' }}
      />

      <div className="p-5">
        {/* Info principal */}
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
                <StatusBadge isActive={category.isActive} />
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                  Orden: {category.order || index + 1}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{category.dishCount}</div>
            <div className="text-xs text-gray-500">
              {category.dishCount === 1 ? 'plato' : 'platos'}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {category.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
        )}

        {/* SECCIÓN DE MÚLTIPLES IMÁGENES MEJORADA */}
        {images.length > 0 ? (
          <div className="mb-4">
            {/* Visor de imagen actual */}
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-2 group">
              <Image
                src={images[currentImageIndex]}
                alt={`${category.name} - imagen ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 200px"
              />

              {/* Indicador de navegación */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => (prev + 1) % images.length);
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Contador */}
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-1">
              {images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className={`relative h-12 bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${idx === currentImageIndex ? 'ring-2 ring-[#EC1F25]' : 'hover:opacity-75'
                    }`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <Image
                    src={img}
                    alt={`${category.name} miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {images.length > 4 && (
                <div
                  className="relative h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-300"
                  onClick={onViewImages}
                >
                  +{images.length - 4}
                </div>
              )}
            </div>

            {/* Indicador de cantidad */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ImageIcon className="w-3 h-3" />
                <span>{images.length} {images.length === 1 ? 'imagen' : 'imágenes'}</span>
              </div>
              <button
                onClick={onViewImages}
                className="text-xs text-[#EC1F25] hover:underline"
              >
                Ver todas
              </button>
            </div>
          </div>
        ) : (
          /* Mensaje si no tiene imágenes */
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Sin imágenes</p>
            <button
              onClick={onViewImages}
              className="text-xs text-[#EC1F25] hover:underline mt-1"
            >
              Agregar imágenes
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {showReorder ? (
            <>
              <button
                onClick={() => onReorder('up')}
                disabled={isFirst}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${isFirst
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
              >
                <ChevronUp className="w-4 h-4" />
                Subir
              </button>
              <button
                onClick={() => onReorder('down')}
                disabled={isLast}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${isLast
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
              <ActionButton onClick={onEdit} bgColor="blue" icon={<Edit2 className="w-4 h-4" />} text="Editar" />
              <ActionButton
                onClick={onToggleStatus}
                bgColor={category.isActive ? 'yellow' : 'green'}
                icon={category.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                text={category.isActive ? 'Desactivar' : 'Activar'}
              />
              <ActionButton
                onClick={onDelete}
                bgColor="red"
                icon={<Trash2 className="w-4 h-4" />}
                text="Eliminar"
                disabled={category.dishCount > 0}
                title={category.dishCount > 0 ? 'Tiene platos asociados' : ''}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
      {isActive ? 'Activa' : 'Inactiva'}
    </span>
  );
}

function ActionButton({
  onClick,
  bgColor,
  icon,
  text,
  disabled = false,
  title = ''
}: {
  onClick: () => void;
  bgColor: 'blue' | 'yellow' | 'green' | 'red';
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
  title?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : colors[bgColor]
        }`}
      title={title}
    >
      {icon}
      {text}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">📂</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay categorías</h3>
      <p className="text-gray-600 mb-6">Comienza creando tu primera categoría</p>
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-[#FBBF24] text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" />
        Crear Primera Categoría
      </button>
    </div>
  );
}

function TipsSection() {
  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Consejos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Tip number="1" title="Orden lógico">
          Organiza las categorías en el orden que los clientes esperan verlas
        </Tip>
        <Tip number="2" title="Múltiples imágenes">
          Sube hasta 5 imágenes por categoría para mostrar variedad
        </Tip>
        <Tip number="3" title="Iconos representativos">
          Usa emojis que representen el tipo de platos
        </Tip>
        <Tip number="4" title="Desactivar temporalmente">
          Desactiva categorías sin platos disponibles
        </Tip>
      </div>
    </div>
  );
}

function Tip({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-600 text-sm font-bold">{number}</span>
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{children}</p>
      </div>
    </div>
  );
}