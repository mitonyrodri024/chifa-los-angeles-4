'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import MenuHeader from '@/components/menu/MenuHeader';
import DishGrid from '@/components/menu/DishGrid';
import { dishService } from '@/lib/firebase/dishService';
import { categoryService } from '@/lib/firebase/categoryService';
import { Dish } from '@/types/menu.types';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // CAMBIADO a array
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Cargar categorías primero
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    loadCategories();
  }, []);

  // Cargar platos según filtros
  useEffect(() => {
    const loadDishes = async () => {
      setIsLoading(true);
      try {
        let dishesData: Dish[] = [];
        
        if (searchQuery) {
          // Priorizar búsqueda
          dishesData = await dishService.searchDishes(searchQuery);
        } else if (selectedCategories.length > 0) {
          // Filtrar por múltiples categorías
          dishesData = await dishService.getDishesByCategories(selectedCategories);
        } else {
          // Todos los platos
          dishesData = await dishService.getAllDishes();
        }
        
        setDishes(dishesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDishes();
  }, [selectedCategories, searchQuery]); // DEPENDENCIAS ACTUALIZADAS

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

  const handleDelivery = async (dish: Dish) => {
    await handleOrder(dish);
    router.push('/checkout');
  };

  const handleEditDish = (dish: Dish) => {
    router.push(`/admin/dishes/edit/${dish.id}`);
  };

  const handleDeleteDish = async (dish: Dish) => {
    if (confirm(`¿Estás seguro de eliminar "${dish.name}"?`)) {
      const success = await dishService.deleteDish(dish.id);
      if (success) {
        const dishesData = await dishService.getAllDishes();
        setDishes(dishesData);
        alert('✅ Plato eliminado exitosamente');
      } else {
        alert('❌ Error al eliminar el plato');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header con filtros */}
        <MenuHeader
          user={user as any}
          onSearch={setSearchQuery}
          dishCount={dishes.length}
          categories={categories}
          selectedCategories={selectedCategories} // CAMBIADO
          onCategoryChange={setSelectedCategories} // CAMBIADO
        />

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#EC1F25] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Cargando nuestro delicioso menú...</p>
          </div>
        ) : (
          <DishGrid
            dishes={dishes}
            onOrder={handleOrder}
            onDelivery={handleDelivery}
            showAdminActions={(user as any)?.role === 'admin'}
            onEditDish={handleEditDish}
            onDeleteDish={handleDeleteDish}
            emptyMessage={
              searchQuery
                ? 'No hay platos que coincidan con tu búsqueda'
                : selectedCategories.length > 0
                ? 'No hay platos en las categorías seleccionadas'
                : 'No hay platos disponibles'
            }
          />
        )}
      </div>
    </main>
  );
}