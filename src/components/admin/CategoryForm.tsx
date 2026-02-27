// components/admin/CategoryForm.tsx
'use client';

import { Category } from '@/types/menu.types';
import { useState } from 'react';
import { X, Palette, AlertCircle } from 'lucide-react';

// Define el tipo para los datos del formulario
type CategoryFormData = Omit<Category, 'id' | 'dishCount' | 'createdAt' | 'updatedAt'>;

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const COLORS = [
  { name: 'Rojo Chifa', value: '#DC2626' },
  { name: 'Amarillo Chifa', value: '#F59E0B' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Gris', value: '#6B7280' },
];

const ICONS = ['🍚', '🍜', '🥟', '🥣', '👨‍🍳', '🥤', '🥢', '🍲', '🥡', '🍤'];

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true,
    icon: category?.icon || '🍽️',
    color: category?.color || '#DC2626',
    order: category?.order || 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
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

    if (formData.order <= 0) {
      newErrors.order = 'El orden debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Crear los datos del formulario con el tipo correcto
    const categoryData: CategoryFormData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      icon: formData.icon,
      color: formData.color,
      order: formData.order
    };

    onSubmit(categoryData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header del formulario */}
      <div className="bg-red-600 from-chifa-red to-red-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {category ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-red-100">
              {category ? 'Modifica la información de la categoría' : 'Organiza tu menú con categorías'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-red-700 rounded-full transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Nombre de la categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-chifa-red focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Chaufas, Entradas, Especialidades"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chifa-red focus:border-transparent"
              placeholder="Describe brevemente esta categoría"
              disabled={isLoading}
            />
          </div>

          {/* Icono y Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Icono
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                      formData.icon === icon
                        ? 'border-chifa-red bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="text-4xl">{formData.icon}</div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center"
                  maxLength={2}
                  placeholder="Emoji"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                      formData.color === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    disabled={isLoading}
                  >
                    {formData.color === color.value && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-400" />
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-12 cursor-pointer"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="#DC2626"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Orden y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden de Visualización *
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-chifa-red focus:border-transparent ${
                  errors.order ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
                disabled={isLoading}
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.order}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Número menor = aparece primero
              </p>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only"
                      id="isActive"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="isActive"
                      className={`block w-14 h-8 rounded-full cursor-pointer transition-all ${
                        formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                        formData.isActive ? 'transform translate-x-6' : ''
                      }`}></span>
                    </label>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.isActive ? 'Activa' : 'Inactiva'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formData.isActive ? 'Visible en el menú' : 'Oculta en el menú'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Vista Previa</h3>
            <div
              className="p-4 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900" style={{ color: formData.color }}>
                  {formData.name || '[Nombre de categoría]'}
                </div>
                {formData.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {formData.description}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-1 bg-white rounded-full font-medium">
                    Orden: {formData.order}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    formData.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isActive ? '✓ Activa' : '✗ Inactiva'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
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
            className="px-6 py-3 bg-chifa-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : category ? 'Actualizar Categoría' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}