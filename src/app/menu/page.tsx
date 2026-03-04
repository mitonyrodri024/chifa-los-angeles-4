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
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  const handleOrder = async (dish: Dish) => {
    const existingItemIndex = cartItems.findIndex(item => item.dishId === dish.id);
    if (existingItemIndex >= 0) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, {
        dishId: dish.id,
        dishName: dish.name,
        price: dish.price,
        quantity: 1,
        image: dish.image,
      }]);
    }
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
      
      {/* Botón para volver al inicio */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EC1F25] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header con categorías - SIN título, SIN buscador, SOLO categorías */}
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