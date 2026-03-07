// src/components/menu/MenuHeader.tsx
'use client';

import { Plus, Tag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import DishGrid from './DishGrid';

// Definir interfaces primero
interface User {
  id: string;
  role: 'admin' | 'user';
  name: string;
  email: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  dishCount: number;
  isActive: boolean;
  order?: number;
  images?: string[];
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  categoryName: string;
  createdAt?: Date;
  updatedAt?: Date;
  orderCount?: number;
  dishType?: 'sopa' | 'menu' | 'normal'; // ← AGREGAR ESTO
}

interface MenuHeaderProps {
  user?: User | null;
  categories?: Category[];
  dishes?: Dish[];
  onOrder?: (dish: Dish) => void;
  onDelivery?: (dish: Dish) => void;
  onPrevCategory?: () => void;
  onNextCategory?: () => void;
  currentCategoryIndex?: number;
  totalCategories?: number;
  onEditDish?: (dish: Dish) => void;
  onDeleteDish?: (dish: Dish) => void;
  showAdminActions?: boolean;
}

export default function MenuHeader({
  user,
  categories = [],
  dishes = [],
  onOrder,
  onDelivery,
  onPrevCategory,
  onNextCategory,
  currentCategoryIndex = 0,
  totalCategories = 0,
  onEditDish,
  onDeleteDish,
  showAdminActions = false
}: MenuHeaderProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Filtrar solo categorías activas y ordenadas
  const activeCategories = categories
    .filter((cat: Category) => cat.isActive)
    .sort((a: Category, b: Category) => (a.order || 0) - (b.order || 0));

  // Obtener categoría actual
  const currentCategory = activeCategories[currentCategoryIndex];
  
  // Obtener platos de la categoría actual con todas las propiedades necesarias
  const currentCategoryDishes = currentCategory 
    ? dishes
        .filter((dish: Dish) => dish.categoryId === currentCategory.id && dish.isAvailable !== false)
        .map((dish: Dish) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description || '',
          price: Number(dish.price) || 0,
          image: dish.image || '',
          categoryId: dish.categoryId,
          categoryName: currentCategory.name,
          isAvailable: dish.isAvailable ?? true,
          isVegetarian: dish.isVegetarian ?? false,
          isSpicy: dish.isSpicy ?? false,
          preparationTime: dish.preparationTime || 15,
          ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
          createdAt: dish.createdAt || new Date(),
          updatedAt: dish.updatedAt,
          orderCount: dish.orderCount || 0,
          dishType: dish.dishType || 'normal' // ← FORZAR 'normal' SI NO EXISTE
        }))
    : [];

  // Obtener imágenes de la categoría (máximo 2)
  const categoryImages = currentCategory?.images?.slice(0, 2) || [];

  // Función para manejar el pedido (para delivery)
  const handleOrder = (dish: Dish) => {
    if (onOrder) {
      onOrder(dish);
    } else {
      // Si no hay onOrder, agregar al carrito directamente
      addToCartDirectly(dish);
    }
  };

  // Función para manejar delivery
  const handleDelivery = (dish: Dish) => {
    if (onDelivery) {
      onDelivery(dish);
    } else {
      // Si no hay onDelivery, agregar al carrito directamente
      addToCartDirectly(dish);
    }
  };

  // Función para agregar directamente al carrito (cuando no hay handlers)
  const addToCartDirectly = (dish: Dish) => {
    try {
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      
      const existingItemIndex = cart.findIndex((item: any) => item.dishId === dish.id);
      
      console.log('🍽️ Agregando desde MenuHeader:', {
        name: dish.name,
        dishType: dish.dishType || 'normal'
      });
      
      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image || '/placeholder.jpg',
          categoryName: dish.categoryName,
          description: dish.description,
          preparationTime: dish.preparationTime,
          dishType: dish.dishType || 'normal' // ← ¡NUEVO! Incluir dishType
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      alert(`✅ "${dish.name}" agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  return (
    <div className="mb-6 md:mb-10">
      {/* Botones admin móvil - SOLO si hay usuario admin */}
      {user?.role === 'admin' && (
        <div className="md:hidden flex gap-2 mb-6">
          <a
            href="/admin/dishes/add"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </a>
          
          <a
            href="/admin/categories"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#EC1F25] font-semibold rounded-xl transition-all active:scale-95 shadow-md border-2 border-[#EC1F25]"
          >
            <Tag className="w-5 h-5" />
            <span>Categorías</span>
          </a>
        </div>
      )}

      {/* Navegación de categorías */}
      {activeCategories.length > 0 && (
        <>
          {/* Navegación entre categorías */}
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={onPrevCategory}
              disabled={currentCategoryIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                currentCategoryIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Barra de progreso */}
              <div className="flex items-center gap-1">
                {activeCategories.map((cat: Category, idx: number) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (idx < currentCategoryIndex && onPrevCategory) {
                        for(let i = 0; i < currentCategoryIndex - idx; i++) onPrevCategory();
                      } else if (idx > currentCategoryIndex && onNextCategory) {
                        for(let i = 0; i < idx - currentCategoryIndex; i++) onNextCategory();
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentCategoryIndex 
                        ? 'w-8 bg-[#EC1F25]' 
                        : idx < currentCategoryIndex
                        ? 'bg-[#EC1F25]/30'
                        : 'bg-gray-300'
                    }`}
                    title={cat.name}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {currentCategoryIndex + 1} / {activeCategories.length}
              </span>
            </div>

            <button
              onClick={onNextCategory}
              disabled={currentCategoryIndex === activeCategories.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                currentCategoryIndex === activeCategories.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#EC1F25] text-white hover:bg-[#d41a1f]'
              }`}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Categoría actual con sus platos */}
          {currentCategory && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              
              {/* Header de categoría - NOMBRE y DESCRIPCIÓN */}
              <div 
                className="p-6 border-b border-gray-200"
                style={{ backgroundColor: `${currentCategory.color || '#EC1F25'}10` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md"
                      style={{ backgroundColor: currentCategory.color || '#EC1F25' }}
                    >
                      <span className="text-white">{currentCategory.icon || '🍽️'}</span>
                    </div>
                    <div>
                      <h1 
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: currentCategory.color || '#EC1F25' }}
                      >
                        {currentCategory.name}
                      </h1>
                      {currentCategory.description && (
                        <p className="text-gray-600 mt-2 text-lg">
                          {currentCategory.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Platos disponibles</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {currentCategoryDishes.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE IMÁGENES DE LA CATEGORÍA - 2 IMÁGENES */}
              {categoryImages.length > 0 && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    Galería de {currentCategory.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryImages.map((img: string, index: number) => (
                      <div 
                        key={index}
                        className="relative rounded-xl overflow-hidden shadow-lg group"
                        style={{ height: '280px' }}
                      >
                        <Image
                          src={img}
                          alt={`${currentCategory.name} - imagen ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN DE PLATOS - GRID DE 4 COLUMNAS EN PANTALLAS GRANDES */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Nuestros Platos
                </h2>
                
                <DishGrid
                  dishes={currentCategoryDishes}
                  onOrder={handleOrder}
                  onDelivery={handleDelivery}
                  showAdminActions={showAdminActions}
                  onEditDish={onEditDish}
                  onDeleteDish={onDeleteDish}
                  emptyMessage={`No hay platos disponibles en ${currentCategory.name}`}
                  hideImages={false}
                />
              </div>
            </div>
          )}

          {/* Mensaje de platos */}
          {currentCategoryDishes.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Mostrando {currentCategoryDishes.length} {currentCategoryDishes.length === 1 ? 'plato' : 'platos'} de {currentCategory.name}
            </div>
          )}
        </>
      )}

      {/* Mensaje si no hay categorías activas */}
      {activeCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📂</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay categorías disponibles
          </h3>
          <p className="text-gray-600">
            Pronto tendremos nuevas categorías en nuestro menú.
          </p>
        </div>
      )}
    </div>
  ); 
}