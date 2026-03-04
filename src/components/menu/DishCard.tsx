// src/components/menu/DishCard.tsx
'use client';

import { Dish } from '@/types/menu.types';
import { Utensils, Truck, Clock, Flame, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DishCardProps {
  dish: Dish;
  onOrder?: () => void;
  onDelivery?: () => void;
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  hideImage?: boolean;
}

export default function DishCard({ 
  dish, 
  onOrder, 
  onDelivery, 
  showAdminActions = false,
  onEdit,
  onDelete,
  hideImage = false
}: DishCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // Función para agregar al carrito (usada por ambos botones)
  const addToCart = () => {
    if (!dish.isAvailable) return;
    
    try {
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      
      const existingItem = cart.find((item: any) => item.dishId === dish.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      alert(`✅ "${dish.name}" agregado al carrito`);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  const handleOrderClick = () => {
    if (!dish.isAvailable) return;
    
    if (onOrder) {
      onOrder();
      return;
    }
    
    addToCart(); // Usar la función común
  };

  const handleDeliveryClick = () => {
    if (!dish.isAvailable) return;
    
    if (onDelivery) {
      onDelivery();
      return;
    }
    
    addToCart(); // Usar la función común
    // Opcional: redirigir al checkout después de agregar
    // router.push('/checkout');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
      
      
      {/* Información del plato */}
      <div className="p-4 flex-grow">
        {/* Categoría */}
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-gray-900">
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
          <span className="text-2xl font-bold text-[#EC1F25]">
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
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        ) : (
          /* Botones para cliente - AMBOS AGREGAN AL CARRITO */
          <div className="flex gap-2">
            <button
              onClick={handleOrderClick}
              disabled={!dish.isAvailable}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                dish.isAvailable
                  ? 'bg-[#EC1F25] hover:bg-[#d41a1f] text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Pedir</span>
            </button>
            
            <button
              onClick={handleDeliveryClick}
              disabled={!dish.isAvailable}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                dish.isAvailable
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}