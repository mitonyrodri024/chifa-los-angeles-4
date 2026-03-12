// src/components/menu/DishCard.tsx
'use client';

import { Dish, Category } from '@/types/menu.types';
import { Utensils, Truck, Clock } from 'lucide-react';
import { useState } from 'react';
import SpecialOptionModal from './SpecialOptionModal';

interface DishCardProps {
  dish: Dish;
  category?: Category;
  onOrder?: () => void;
  onDelivery?: () => void;
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  hideImage?: boolean;
}

export default function DishCard({
  dish,
  category,
  onOrder,
  onDelivery,
  showAdminActions = false,
  onEdit,
  onDelete,
  hideImage = false
}: DishCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'order' | 'delivery' | null>(null);

  // Verificar si la categoría tiene opciones especiales
  const hasSpecialOptions = category?.hasSpecialOptions &&
    category.specialOptions &&
    category.specialOptions.length > 0;

  // Función para agregar al carrito con opción especial
  const addToCartWithSpecialOption = (selectedOption: any) => {
    if (!dish.isAvailable) return;

    const finalPrice = dish.price + selectedOption.price;

    console.log('🍽️ Agregando al carrito con opción especial:', {
      name: dish.name,
      option: selectedOption.label,
      basePrice: dish.price,
      extraPrice: selectedOption.price,
      finalPrice
    });

    try {
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const itemId = `${dish.id}_${selectedOption.type}`;

      const existingItemIndex = cart.findIndex((item: any) =>
        item.dishId === dish.id &&
        item.selectedSpecialOption?.type === selectedOption.type
      );

      const cartItem = {
        dishId: dish.id,
        uniqueId: itemId,
        dishName: `${dish.name} (${selectedOption.label})`,
        basePrice: dish.price,
        price: finalPrice,
        quantity: 1,
        image: dish.image || '/placeholder.jpg',
        categoryId: dish.categoryId,
        categoryName: dish.categoryName,
        description: dish.description,
        preparationTime: dish.preparationTime,
        dishType: dish.dishType || 'normal',
        selectedSpecialOption: {
          type: selectedOption.type,
          label: selectedOption.label,
          price: selectedOption.price
        },
        hasSpecialOption: true
      };

      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));

      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 2000);

      setShowSpecialModal(false);
      setPendingAction(null);

    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('❌ Error al agregar al carrito');
    }
  };

  // 🔥 FUNCIÓN CORREGIDA - AGREGAR categoryId Y basePrice
  const addToCartNormal = () => {
    if (!dish.isAvailable) return;

    console.log('🍽️ AGREGANDO PLATO:', {
      dishId: dish.id,
      dishName: dish.name,
      categoryId: dish.categoryId,
      categoryName: dish.categoryName
    });

    try {
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const existingItemIndex = cart.findIndex((item: any) => item.dishId === dish.id);

      const newItem = {
        dishId: dish.id,
        dishName: dish.name,
        price: dish.price,
        basePrice: dish.price,           // 👈 AGREGADO: guardar precio base
        quantity: 1,
        image: dish.image || '/placeholder.jpg',
        categoryId: dish.categoryId,      // 👈 AGREGADO
        categoryName: dish.categoryName,
        description: dish.description,
        preparationTime: dish.preparationTime,
        dishType: dish.dishType || 'normal'
      };

      console.log('📦 ITEM A GUARDAR:', newItem);

      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push(newItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));

      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 2000);

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

    if (hasSpecialOptions) {
      setPendingAction('order');
      setShowSpecialModal(true);
    } else {
      addToCartNormal();
    }
  };

  const handleDeliveryClick = () => {
    if (!dish.isAvailable) return;

    if (onDelivery) {
      onDelivery();
      return;
    }

    if (hasSpecialOptions) {
      setPendingAction('delivery');
      setShowSpecialModal(true);
    } else {
      addToCartNormal();
    }
  };

  const getDishTypeIcon = () => {
    if (dish.dishType === 'sopa') return '🍲';
    if (dish.dishType === 'menu') return '🍱';
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full relative">

      {showAddedMessage && (
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
          ✅ Agregado
        </div>
      )}

      <div className="p-4 flex-grow">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-gray-900">
            {dish.categoryName}
          </span>

          {hideImage && dish.dishType && dish.dishType !== 'normal' && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${dish.dishType === 'sopa'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
              }`}>
              {dish.dishType === 'sopa' ? '🍲 Sopa' : '🍱 Menú'}
            </span>
          )}

          {hasSpecialOptions && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
              ✨ Elegir opción
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">
          {dish.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {dish.description}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          {dish.preparationTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{dish.preparationTime} min</span>
            </div>
          )}

          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
              <span>🥘 {dish.ingredients.slice(0, 2).join(', ')}</span>
              {dish.ingredients.length > 2 && <span>+{dish.ingredients.length - 2}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-[#EC1F25]">
            S/ {dish.price.toFixed(2)}
          </span>

          <div className="flex items-center gap-2">
            {dish.dishType && dish.dishType !== 'normal' && (
              <span className="text-xs text-gray-500">
                {dish.dishType === 'sopa' ? '+S/0.50' : '+S/1.00'} en delivery
              </span>
            )}

            {dish.orderCount && dish.orderCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                🔥 {dish.orderCount} pedidos
              </span>
            )}
          </div>
        </div>

        {hasSpecialOptions && category?.specialOptions && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Opciones disponibles:</p>
            <div className="space-y-1">
              {category.specialOptions.map((opt, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-600">{opt.label}</span>
                  <span className="font-semibold text-[#EC1F25]">+S/ {opt.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pt-0 border-t border-gray-100">
        {showAdminActions ? (
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
          <div className="flex gap-2">
            <button
              onClick={handleOrderClick}
              disabled={!dish.isAvailable}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${dish.isAvailable
                  ? 'bg-[#EC1F25] hover:bg-[#d41a1f] text-white shadow-md hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Pedir</span>
            </button>

            <button
              onClick={handleDeliveryClick}
              disabled={!dish.isAvailable}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${dish.isAvailable
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-md hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>
        )}
      </div>

      {hasSpecialOptions && category?.specialOptions && (
        <SpecialOptionModal
          isOpen={showSpecialModal}
          onClose={() => {
            setShowSpecialModal(false);
            setPendingAction(null);
          }}
          dishName={dish.name}
          dishPrice={dish.price}
          options={category.specialOptions}
          onSelect={addToCartWithSpecialOption}
        />
      )}
    </div>
  );
}