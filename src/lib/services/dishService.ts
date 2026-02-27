'use client';

import { Dish, FilterOptions } from '@/types/menu.types';
import { sampleDishes } from '@/lib/date/dishes';

export class DishService {
  private dishes: Dish[] = sampleDishes;

  // Obtener todos los platos
  getAllDishes(): Dish[] {
    return this.dishes;
  }

  // Obtener plato por ID
  getDishById(id: string): Dish | undefined {
    return this.dishes.find(dish => dish.id === id);
  }

  // Filtrar platos por categoría
  getDishesByCategory(categoryId: string): Dish[] {
    return this.dishes.filter(dish => dish.categoryId === categoryId);
  }

  // Filtrar platos con múltiples opciones
  filterDishes(options: FilterOptions): Dish[] {
    let filtered = [...this.dishes];

    if (options.categoryId) {
      filtered = filtered.filter(dish => dish.categoryId === options.categoryId);
    }

    if (options.isVegetarian !== undefined) {
      filtered = filtered.filter(dish => dish.isVegetarian === options.isVegetarian);
    }

    if (options.isSpicy !== undefined) {
      filtered = filtered.filter(dish => dish.isSpicy === options.isSpicy);
    }

    if (options.minPrice !== undefined) {
      filtered = filtered.filter(dish => dish.price >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(dish => dish.price <= options.maxPrice!);
    }

    // Ordenar
    if (options.sortBy) {
      filtered.sort((a, b) => {
        if (options.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (options.sortBy === 'price') {
          return a.price - b.price;
        }
        return 0;
      });

      if (options.sortOrder === 'desc') {
        filtered.reverse();
      }
    }

    return filtered;
  }

  // Obtener platos recomendados (ej: más populares)
  getRecommendedDishes(limit: number = 4): Dish[] {
    return this.dishes.slice(0, limit);
  }

  // Buscar platos por nombre o descripción
  searchDishes(query: string): Dish[] {
    const lowerQuery = query.toLowerCase();
    return this.dishes.filter(dish =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.description.toLowerCase().includes(lowerQuery) ||
      dish.ingredients?.some(ingredient => ingredient.toLowerCase().includes(lowerQuery))
    );
  }

  // Obtener categorías únicas de los platos
  getCategoriesFromDishes() {
    const categories = new Map();
    this.dishes.forEach(dish => {
      if (!categories.has(dish.categoryId)) {
        categories.set(dish.categoryId, {
          id: dish.categoryId,
          name: dish.categoryName,
          count: 1
        });
      } else {
        categories.get(dish.categoryId).count++;
      }
    });
    return Array.from(categories.values());
  }

  // Agregar un nuevo plato (simulado)
  addDish(dish: Omit<Dish, 'id' | 'createdAt'>): Dish {
    const newDish: Dish = {
      ...dish,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.dishes.push(newDish);
    return newDish;
  }

  // Actualizar un plato (simulado)
  updateDish(id: string, updates: Partial<Dish>): Dish | null {
    const index = this.dishes.findIndex(dish => dish.id === id);
    if (index === -1) return null;
    
    this.dishes[index] = {
      ...this.dishes[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.dishes[index];
  }

  // Eliminar un plato (simulado)
  deleteDish(id: string): boolean {
    const initialLength = this.dishes.length;
    this.dishes = this.dishes.filter(dish => dish.id !== id);
    return this.dishes.length < initialLength;
  }
}

// Instancia singleton del servicio
export const dishService = new DishService();