// src/components/menu/DishCard.tsx
'use client';

import { Dish } from '@/types/menu.types';
import { Utensils, Truck, Clock } from 'lucide-react';
import { useState } from 'react';

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

  // Función para agregar al carrito (CORREGIDA)
  const addToCart = () => {
    if (!dish.isAvailable) return;
    
    try {
      // Obtener carrito actual
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      
      // Verificar si el plato ya está en el carrito
      const existingItemIndex = cart.findIndex((item: any) => item.dishId === dish.id);
      
      if (existingItemIndex !== -1) {
        // Si existe, incrementar cantidad
        cart[existingItemIndex].quantity += 1;
      } else {
        // Si no existe, agregar nuevo item con TODOS los datos del plato
        cart.push({
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image || '/placeholder.jpg',
          categoryName: dish.categoryName,
          description: dish.description,
          preparationTime: dish.preparationTime
        });
      }
      
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Disparar evento para actualizar el navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Mostrar confirmación
      alert(`✅ "${dish.name}" agregado al carrito`);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('❌ Error al agregar al carrito');
    }
  };

  const handleOrderClick = () => {
    if (!dish.isAvailable) return;
    
    if (onOrder) {
      onOrder();
      return;
    }
    
    addToCart();
  };

  const handleDeliveryClick = () => {
    if (!dish.isAvailable) return;
    
    if (onDelivery) {
      onDelivery();
      return;
    }
    
    addToCart(); // Ahora SÍ funciona
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
      
      {/* Imagen (opcional) */}
      {!hideImage && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {dish.image && !imageError ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-yellow-100">
              <span className="text-6xl">🍜</span>
            </div>
          )}
          {!dish.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg px-4 py-2 bg-red-600 rounded-lg transform -rotate-12">
                NO DISPONIBLE
              </span>
            </div>
          )}
        </div>
      )}
      
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
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {dish.description}
        </p>

        {/* Información adicional */}
        {dish.preparationTime && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>{dish.preparationTime} min</span>
          </div>
        )}

        {/* Precio */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-[#EC1F25]">
            S/ {dish.price.toFixed(2)}
          </span>
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
          /* Botones para cliente - AHORA AMBOS FUNCIONAN */
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