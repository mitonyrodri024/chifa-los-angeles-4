// components/admin/DishForm.tsx
'use client';

import { Dish } from '@/types/menu.types';
import { Category } from '@/types/menu.types';
import { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface DishFormProps {
  dish?: Dish | null;
  categories: Category[];
  onSubmit: (data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function DishForm({
  dish,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}: DishFormProps) {
  const [formData, setFormData] = useState({
    name: dish?.name || '',
    description: dish?.description || '',
    price: dish?.price || 0,
    categoryId: dish?.categoryId || categories[0]?.id || '',
    isAvailable: dish?.isAvailable ?? true,
    isVegetarian: dish?.isVegetarian ?? false,
    isSpicy: dish?.isSpicy ?? false,
    preparationTime: dish?.preparationTime || 15,
    ingredients: dish?.ingredients?.join(', ') || '',
    // Eliminamos 'image' del estado
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'preparationTime') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Debe seleccionar una categoría';
    }

    if (formData.preparationTime <= 0) {
      newErrors.preparationTime = 'El tiempo de preparación debe ser mayor a 0';
    }

    // Eliminamos la validación de imagen

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'> = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: formData.price,
    image: '', // ← IMAGEN VACÍA O POR DEFECTO
    categoryId: formData.categoryId,
    categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
    isAvailable: formData.isAvailable,
    isVegetarian: formData.isVegetarian,
    isSpicy: formData.isSpicy,
    preparationTime: formData.preparationTime,
    ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
    // orderCount es opcional, no necesitas incluirlo
  };

  onSubmit(dishData);
};  

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header del formulario */}
      <div className="bg-[#EC1F25] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? '✏️ Editar Plato' : '➕ Agregar Nuevo Plato'}
            </h2>
            <p className="text-white/90">
              {isEditing 
                ? 'Modifica la información del plato existente'
                : 'Completa todos los campos para agregar un nuevo plato al menú'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-[#d41a1f] rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Nombre del plato */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Plato *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Arroz Chaufa Especial"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe el plato, ingredientes principales, preparación..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio (S/) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                S/
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.price}
              </p>
            )}
          </div>

          {/* Tiempo de preparación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo de Preparación (minutos) *
            </label>
            <input
              type="number"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent ${
                errors.preparationTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="15"
            />
            {errors.preparationTime && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.preparationTime}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* SECCIÓN DE IMAGEN ELIMINADA COMPLETAMENTE */}

          {/* Ingredientes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredientes
            </label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent"
              placeholder="Ej: Arroz, pollo, cerdo, huevo, cebollín"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separa los ingredientes con comas
            </p>
          </div>
        </div>

        {/* Opciones booleanas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5 text-[#EC1F25] rounded focus:ring-[#EC1F25]"
            />
            <span className="ml-3 font-medium text-gray-700">Disponible</span>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              name="isVegetarian"
              checked={formData.isVegetarian}
              onChange={handleChange}
              className="w-5 h-5 text-[#EC1F25] rounded focus:ring-[#EC1F25]"
            />
            <span className="ml-3 font-medium text-gray-700">Vegetariano</span>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              name="isSpicy"
              checked={formData.isSpicy}
              onChange={handleChange}
              className="w-5 h-5 text-[#EC1F25] rounded focus:ring-[#EC1F25]"
            />
            <span className="ml-3 font-medium text-gray-700">Picante</span>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#EC1F25] text-white font-semibold rounded-lg hover:bg-[#d41a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditing ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : isEditing ? (
              <>
                <span>✏️</span>
                Actualizar Plato
              </>
            ) : (
              <>
                <span>➕</span>
                Agregar Plato
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}