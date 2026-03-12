// src/components/menu/DishGrid.tsx
'use client';

import { Dish, Category } from '@/types/menu.types';
import DishCard from './DishCard';

interface DishGridProps {
  dishes: Dish[];
  categories?: Category[]; // ← NUEVO: Recibir todas las categorías
  onOrder: (dish: Dish) => void;
  onDelivery: (dish: Dish) => void;
  showAdminActions?: boolean;
  onEditDish?: (dish: Dish) => void;
  onDeleteDish?: (dish: Dish) => void;
  emptyMessage?: string;
  hideImages?: boolean;
}

export default function DishGrid({ 
  dishes, 
  categories = [], // ← NUEVO: Array de categorías
  onOrder, 
  onDelivery, 
  showAdminActions = false,
  onEditDish,
  onDeleteDish,
  emptyMessage = 'No hay platos disponibles',
  hideImages = false
}: DishGridProps) {
  
  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Intenta con otros filtros o categorías
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {dishes.map(dish => {
        // Encontrar la categoría completa para este plato
        const dishCategory = categories.find(cat => cat.id === dish.categoryId);
        
        return (
          <DishCard
            key={dish.id}
            dish={dish}
            category={dishCategory} // ← PASAR LA CATEGORÍA COMPLETA
            onOrder={() => onOrder(dish)}
            onDelivery={() => onDelivery(dish)}
            showAdminActions={showAdminActions}
            onEdit={onEditDish ? () => onEditDish(dish) : undefined}
            onDelete={onDeleteDish ? () => onDeleteDish(dish) : undefined}
            hideImage={hideImages}
          />
        );
      })}
    </div>
  );
}