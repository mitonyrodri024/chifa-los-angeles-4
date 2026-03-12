// src/components/admin/CategoryForm.tsx
'use client';

import { Category, SpecialOptionConfig } from '@/types/menu.types';
import { useState, useRef } from 'react';
import { X, Upload, AlertCircle, Loader2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'dishCount'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true,
    icon: category?.icon || '',
    color: category?.color || '#EC1F25',
    order: category?.order || 0,
    images: category?.images || [],
    // Opciones especiales para checkout
    specialOptions: category?.specialOptions || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colores predefinidos para categorías
  const colorOptions = [
    { value: '#EC1F25', label: 'Rojo' },
    { value: '#F59E0B', label: 'Naranja' },
    { value: '#10B981', label: 'Verde' },
    { value: '#3B82F6', label: 'Azul' },
    { value: '#8B5CF6', label: 'Púrpura' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#6B7280', label: 'Gris' },
    { value: '#1F2937', label: 'Oscuro' },
  ];

  // Iconos predefinidos
  const iconOptions = [
    { value: '🍜', label: 'Fideos' },
    { value: '🍚', label: 'Arroz' },
    { value: '🥟', label: 'Dim Sum' },
    { value: '🥘', label: 'Olla' },
    { value: '🍗', label: 'Pollo' },
    { value: '🥩', label: 'Carne' },
    { value: '🐟', label: 'Pescado' },
    { value: '🥬', label: 'Vegetales' },
    { value: '🍲', label: 'Sopa' },
    { value: '🥡', label: 'Take Away' },
  ];

  // Manejar subida de múltiples imágenes
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newErrors: string[] = [];
    const validImages: string[] = [];

    Array.from(files).forEach((file, index) => {
      if (file.size > 1024 * 1024) {
        newErrors.push(`Imagen ${index + 1}: debe ser menor a 1MB`);
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        newErrors.push(`Imagen ${index + 1}: formato no válido. Use JPG, PNG o WebP`);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        validImages.push(base64);
        
        if (validImages.length + formData.images.length === files.length + formData.images.length) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...validImages]
          }));
          setImageErrors(newErrors);
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        newErrors.push(`Imagen ${index + 1}: error al leer el archivo`);
        if (newErrors.length === files.length) {
          setImageErrors(newErrors);
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  // Eliminar una imagen específica
  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
    
    if (currentImageIndex >= formData.images.length - 1) {
      setCurrentImageIndex(Math.max(0, formData.images.length - 2));
    }
  };

  // Reordenar imágenes (mover hacia arriba)
  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...formData.images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setFormData(prev => ({ ...prev, images: newImages }));
    setCurrentImageIndex(index - 1);
  };

  // Reordenar imágenes (mover hacia abajo)
  const moveImageDown = (index: number) => {
    if (index === formData.images.length - 1) return;
    const newImages = [...formData.images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setFormData(prev => ({ ...prev, images: newImages }));
    setCurrentImageIndex(index + 1);
  };

  // Arrastrar y soltar para múltiples imágenes
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files && files.length > 0) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => dataTransfer.items.add(file));
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar cambios en opciones especiales
  const handleSpecialOptionChange = (index: number, field: keyof SpecialOptionConfig, value: any) => {
    const newOptions = [...(formData.specialOptions || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    if (field === 'label' && !newOptions[index].type) {
      newOptions[index].type = value.toLowerCase().replace(/\s+/g, '_');
    }
    
    setFormData(prev => ({ ...prev, specialOptions: newOptions }));
  };

  // Agregar nueva opción especial
  const addSpecialOption = () => {
    const newOption: SpecialOptionConfig = {
      type: `option_${Date.now()}`,
      label: '',
      price: 0,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      specialOptions: [...(prev.specialOptions || []), newOption]
    }));
  };

  // Eliminar opción especial
  const removeSpecialOption = (index: number) => {
    const newOptions = formData.specialOptions?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, specialOptions: newOptions }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validar opciones especiales
    formData.specialOptions?.forEach((opt, index) => {
      if (!opt.label.trim()) {
        newErrors[`specialOption_${index}`] = `La opción ${index + 1} necesita un nombre`;
      }
      if (opt.price <= 0) {
        newErrors[`specialOptionPrice_${index}`] = `La opción ${index + 1} necesita un precio válido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'dishCount'> = {
    name: formData.name.trim(),
    description: formData.description.trim() || undefined,
    isActive: formData.isActive,
    icon: formData.icon || undefined,
    color: formData.color,
    order: formData.order,
    images: formData.images,
    specialOptions: formData.specialOptions // Opciones para checkout
  };

  // 🔥🔥🔥 LOG CRUCIAL 🔥🔥🔥
  console.log('🔥🔥🔥 CATEGORY FORM - ENVIANDO DATOS:', {
    name: categoryData.name,
    specialOptions: categoryData.specialOptions,
    specialOptionsCount: categoryData.specialOptions?.length || 0,
    specialOptionsJSON: JSON.stringify(categoryData.specialOptions)
  });

  onSubmit(categoryData);
};

  // Función para obtener el tamaño total de las imágenes
  const getTotalImagesSize = () => {
    return formData.images.reduce((total, img) => {
      const base64WithoutPrefix = img.split(',')[1] || img;
      return total + Math.round((base64WithoutPrefix.length * 3) / 4 / 1024);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header del formulario */}
      <div className="bg-[#EC1F25] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? '✏️ Editar Categoría' : '➕ Agregar Nueva Categoría'}
            </h2>
            <p className="text-white/90">
              {isEditing 
                ? 'Modifica la información de la categoría'
                : 'Completa los campos para agregar una nueva categoría'}
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Sopas, Arroces, Tallarines..."
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
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent"
              placeholder="Describe brevemente esta categoría..."
            />
          </div>

          {/* SECCIÓN DE MÚLTIPLES IMÁGENES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes de la Categoría 
              <span className="text-xs text-gray-500 ml-2">
                (Máx. 5 imágenes • 1MB cada una • JPG, PNG, WebP)
              </span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImagesChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              id="images-upload"
              disabled={formData.images.length >= 5}
            />
            
            {/* Grid de imágenes */}
            {formData.images.length > 0 && (
              <div className="mb-4">
                {/* Visor principal */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ height: '300px' }}>
                  {formData.images[currentImageIndex] && (
                    <Image
                      src={formData.images[currentImageIndex]}
                      alt={`Imagen ${currentImageIndex + 1} de ${formData.name}`}
                      fill
                      className="object-contain"
                    />
                  )}
                  
                  {/* Controles de navegación */}
                  {formData.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentImageIndex === 0}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentImageIndex(prev => Math.min(formData.images.length - 1, prev + 1))}
                        disabled={currentImageIndex === formData.images.length - 1}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  
                  {/* Contador de imágenes */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {formData.images.length}
                  </div>
                </div>

                {/* Miniaturas */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {formData.images.map((img, index) => (
                    <div
                      key={index}
                      className={`relative group cursor-pointer ${
                        index === currentImageIndex ? 'ring-2 ring-[#EC1F25]' : ''
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <div className="relative h-16 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={img}
                          alt={`Miniatura ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Botones de control sobre la miniatura */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImageUp(index);
                          }}
                          disabled={index === 0}
                          className="p-1 bg-white rounded-full hover:bg-gray-100 disabled:opacity-30"
                          title="Mover izquierda"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImageDown(index);
                          }}
                          disabled={index === formData.images.length - 1}
                          className="p-1 bg-white rounded-full hover:bg-gray-100 disabled:opacity-30"
                          title="Mover derecha"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Eliminar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Información de imágenes */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>{formData.images.length} imagen(es) seleccionada(s)</span>
                  <span>Tamaño total: {getTotalImagesSize()} KB</span>
                </div>
              </div>
            )}

            {/* Área de upload */}
            {formData.images.length < 5 && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isUploading 
                    ? 'border-blue-300 bg-blue-50' 
                    : imageErrors.length > 0
                      ? 'border-red-300 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 hover:border-[#EC1F25] hover:bg-red-50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-3" />
                    <p className="text-blue-600 font-medium">Procesando imágenes...</p>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-16 h-16 mx-auto mb-4 ${
                      imageErrors.length > 0 ? 'text-red-400' : 'text-gray-400'
                    }`} />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {formData.images.length === 0 
                        ? 'Subir imágenes de la categoría'
                        : 'Agregar más imágenes'}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      Arrastra y suelta imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="text-gray-500 text-sm">
                      Puedes seleccionar múltiples imágenes a la vez
                    </p>
                    <div className="flex justify-center gap-2 mt-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">JPG</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">PNG</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">WebP</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">Máx 1MB c/u</span>
                    </div>
                    
                    {/* Errores de imagen */}
                    {imageErrors.length > 0 && (
                      <div className="mt-4 text-left">
                        {imageErrors.map((error, idx) => (
                          <p key={idx} className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN DE OPCIONES PARA CHECKOUT */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Opciones adicionales para checkout
                </h3>
                <p className="text-sm text-gray-500">
                  Estas opciones aparecerán en el checkout para que el cliente elija (ej: Con Sopa +S/2.50, Con Wantán +S/2.00)
                </p>
              </div>
              <button
                type="button"
                onClick={addSpecialOption}
                className="flex items-center gap-2 px-4 py-2 bg-[#EC1F25] text-white font-medium rounded-lg hover:bg-[#d41a1f] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Opción
              </button>
            </div>

            {/* Lista de opciones */}
            <div className="space-y-3">
              {formData.specialOptions?.map((option, index) => (
                <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Nombre de la opción
                        </label>
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => handleSpecialOptionChange(index, 'label', e.target.value)}
                          placeholder="Ej: Con Sopa"
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            errors[`specialOption_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`specialOption_${index}`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`specialOption_${index}`]}</p>
                        )}
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Precio adicional
                        </label>
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) => handleSpecialOptionChange(index, 'price', Number(e.target.value))}
                          placeholder="0.00"
                          step="0.50"
                          min="0"
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            errors[`specialOptionPrice_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={option.description || ''}
                        onChange={(e) => handleSpecialOptionChange(index, 'description', e.target.value)}
                        placeholder="Ej: Sopa wantán especial"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    {errors[`specialOptionPrice_${index}`] && (
                      <p className="text-xs text-red-600">{errors[`specialOptionPrice_${index}`]}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecialOption(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors mt-6"
                    title="Eliminar opción"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {(!formData.specialOptions || formData.specialOptions.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No hay opciones configuradas</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Haz clic en "Agregar Opción" para comenzar
                  </p>
                </div>
              )}
            </div>

            {/* Vista previa de cómo se verán las opciones */}
            {formData.specialOptions && formData.specialOptions.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <span>👁️ Vista previa en checkout</span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                    {formData.specialOptions.length} opción(es)
                  </span>
                </h4>
                <div className="space-y-2">
                  {formData.specialOptions.map((option, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-blue-100">
                      <div>
                        <span className="font-medium text-gray-900">{option.label || `Opción ${index + 1}`}</span>
                        {option.description && (
                          <span className="text-xs text-gray-500 ml-2">({option.description})</span>
                        )}
                      </div>
                      <span className="font-semibold text-[#EC1F25]">+S/ {option.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <p className="text-xs text-blue-700 mt-2">
                    * El cliente podrá elegir una de estas opciones al finalizar su pedido
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Icono y Color en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent"
              >
                <option value="">Sin icono</option>
                {iconOptions.map(icon => (
                  <option key={icon.value} value={icon.value}>
                    {icon.value} - {icon.label}
                  </option>
                ))}
              </select>
              {formData.icon && (
                <div className="mt-2 text-center text-4xl">
                  {formData.icon}
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-gray-800 scale-110' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent"
                placeholder="#EC1F25"
              />
            </div>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden de Visualización
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full md:w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Número más bajo aparece primero
            </p>
          </div>

          {/* Estado activo */}
          <div>
            <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-[#EC1F25] rounded focus:ring-[#EC1F25]"
              />
              <span className="ml-3 font-medium text-gray-700">
                Categoría activa (visible en el menú)
              </span>
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading || isUploading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="px-6 py-3 bg-[#EC1F25] text-white font-semibold rounded-lg hover:bg-[#d41a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isUploading ? 'Procesando imágenes...' : isEditing ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : isEditing ? (
              <>
                <span>✏️</span>
                Actualizar Categoría
              </>
            ) : (
              <>
                <span>➕</span>
                Agregar Categoría
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}