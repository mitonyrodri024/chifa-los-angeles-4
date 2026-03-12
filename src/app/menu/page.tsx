// src/app/menu/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import MenuHeader from '@/components/menu/MenuHeader';
import { dishService } from '@/lib/firebase/dishService';
import { categoryService } from '@/lib/firebase/categoryService';
import { Dish, Category } from '@/types/menu.types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MenuPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Cargar categorías primero
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        // Ordenar categorías por el campo 'order'
        const sortedCategories = categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    loadCategories();
  }, []);

  // Cargar todos los platos
  useEffect(() => {
    const loadDishes = async () => {
      setIsLoading(true);
      try {
        const dishesData = await dishService.getAllDishes();
        
        // 🔥 LOG PARA VERIFICAR QUE LOS PLATOS TIENEN categoryId
        console.log('📦 PLATOS CARGADOS:', dishesData.map(d => ({
          id: d.id,
          name: d.name,
          categoryId: d.categoryId,
          categoryName: d.categoryName
        })));
        
        setDishes(dishesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDishes();
  }, []);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 Carrito cargado desde localStorage:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      console.log('💾 Carrito guardado en localStorage:', cartItems);
    } else {
      localStorage.removeItem('cart');
    }
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  // 🔥 FUNCIÓN CORREGIDA - handleOrder
  const handleOrder = async (dish: Dish) => {
    console.log('🔥🔥🔥 AGREGANDO PLATO:', {
      dishId: dish.id,
      dishName: dish.name,
      categoryId: dish.categoryId,
      categoryName: dish.categoryName,
      dishType: dish.dishType
    });

    // Verificar que el plato tiene categoryId
    if (!dish.categoryId) {
      console.error('❌ ERROR: El plato no tiene categoryId:', dish);
      alert('Error: El plato no tiene categoría asignada');
      return;
    }

    const existingItemIndex = cartItems.findIndex(item => item.dishId === dish.id);

    const newItem = {
      dishId: dish.id,
      dishName: dish.name,
      price: dish.price,
      quantity: 1,
      image: dish.image || '/placeholder.jpg',
      categoryId: dish.categoryId,        // 👈 ESTO ES CRÍTICO
      categoryName: dish.categoryName,
      description: dish.description,
      preparationTime: dish.preparationTime,
      dishType: dish.dishType || 'normal'
    };

    console.log('📦 ITEM A GUARDAR:', newItem);

    let updatedCart;
    if (existingItemIndex >= 0) {
      updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      console.log('🔄 Cantidad actualizada:', updatedCart[existingItemIndex]);
    } else {
      updatedCart = [...cartItems, newItem];
      console.log('✅ Nuevo item agregado:', newItem);
    }

    setCartItems(updatedCart);
    alert(`✅ "${dish.name}" agregado al carrito`);
  };

  // Función para ir a la categoría anterior
  const goToPrevCategory = () => {
    const activeCategories = categories.filter(cat => cat.isActive);
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Función para ir a la categoría siguiente
  const goToNextCategory = () => {
    const activeCategories = categories.filter(cat => cat.isActive);
    if (currentCategoryIndex < activeCategories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeCategories = categories.filter(cat => cat.isActive);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header con categorías */}
        <MenuHeader
          user={user as any}
          categories={categories}
          dishes={dishes}
           
          onPrevCategory={goToPrevCategory}
          onNextCategory={goToNextCategory}
          currentCategoryIndex={currentCategoryIndex}
          totalCategories={activeCategories.length}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#EC1F25] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Cargando nuestro delicioso menú...</p>
          </div>
        )}
      </div>
    </main>
  );
}