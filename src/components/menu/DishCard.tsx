'use client';

import { Dish } from '@/types/menu.types';
import { Utensils, Truck, Clock, Flame, Leaf, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface DishCardProps {
  dish: Dish;
  onOrder?: () => void;
  onDelivery?: () => void;
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DishCard({ 
  dish, 
  onOrder, 
  onDelivery, 
  showAdminActions = false,
  onEdit,
  onDelete 
}: DishCardProps) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
      {/* Imagen del plato - CORREGIDO */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <div className="absolute top-3 left-3 z-10">
          {dish.isVegetarian && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Vegetariano
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3 z-10">
          {dish.isSpicy && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Picante
            </span>
          )}
        </div>
        
        <div className="w-full h-full">
          {dish.image && !imageError ? (
            // Mostrar imagen Base64 directamente con <img>
            <img 
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => console.log('✅ Imagen cargada exitosamente:', dish.name)}
            />
          ) : (
            // Placeholder si no hay imagen o hay error
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Sin imagen</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información del plato */}
      <div className="p-4 flex-grow">
        {/* Categoría */}
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-chifa-yellow text-gray-900">
            {dish.categoryName}
          </span>
        </div>

        {/* Nombre */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {dish.name}
        </h3>

        {/* Descripción */}
        <div className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {dish.description}
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {dish.preparationTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{dish.preparationTime} min</span>
            </div>
          )}
          
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="text-xs text-gray-400">
              {dish.ingredients.slice(0, 2).join(', ')}
              {dish.ingredients.length > 2 && '...'}
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-chifa-red">
            S/ {dish.price.toFixed(2)}
          </span>
          {!dish.isAvailable && (
            <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
              No disponible
            </span>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="p-4 pt-0 border-t border-gray-100">
        {showAdminActions ? (
          /* Botones para administrador */
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        ) : (
          /* Botones para cliente */
          <div className="flex gap-3">
            <button
              onClick={onOrder}
              disabled={!dish.isAvailable}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                dish.isAvailable
                  ? 'bg-chifa-red hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Utensils className="w-4 h-4" />
              Pedir Aquí
            </button>
            
            <button
              onClick={onDelivery}
              disabled={!dish.isAvailable}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                dish.isAvailable
                  ? 'bg-chifa-yellow hover:bg-yellow-600 text-gray-900 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Truck className="w-4 h-4" />
              Delivery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}