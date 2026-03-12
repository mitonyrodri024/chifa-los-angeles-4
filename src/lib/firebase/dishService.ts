// src/lib/firebase/dishService.ts
'use client';

import { Dish, FilterOptions } from '@/types/menu.types';
import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';

const DISHES_COLLECTION = 'dishes';

export class DishService {
  // Obtener todos los platos (ORDENADOS POR 'order')
  async getAllDishes(): Promise<Dish[]> {
    try {
      console.log('🔍 Obteniendo platos de Firebase...');
      // 🔥 CAMBIADO: ordenar por 'order' en lugar de 'createdAt'
      const q = query(collection(db, DISHES_COLLECTION), orderBy('order', 'asc'));

      const querySnapshot = await getDocs(q);
      const dishes: Dish[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dishes.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          image: data.image || '',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          isAvailable: data.isAvailable ?? true,
          ingredients: data.ingredients || [],
          preparationTime: data.preparationTime || 15,
          isSpicy: data.isSpicy || false,
          isVegetarian: data.isVegetarian || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          orderCount: data.orderCount || 0,
          dishType: data.dishType || 'normal',
          order: data.order || 0 // 👈 NUEVO: campo order
        } as Dish);
      });

      console.log(`✅ ${dishes.length} platos cargados desde Firebase`);
      return dishes;
    } catch (error: any) {
      console.error('❌ Error al obtener platos:', error.message);
      return [];
    }
  }

  // Obtener plato por ID
  async getDishById(id: string): Promise<Dish | null> {
    try {
      const docRef = doc(db, DISHES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📦 Datos crudos de Firebase:', data);

        return {
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          image: data.image || '',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          isAvailable: data.isAvailable ?? true,
          ingredients: data.ingredients || [],
          preparationTime: data.preparationTime || 15,
          isSpicy: data.isSpicy || false,
          isVegetarian: data.isVegetarian || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          orderCount: data.orderCount || 0,
          dishType: data.dishType || 'normal',
          order: data.order || 0 // 👈 NUEVO: campo order
        } as Dish;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error al obtener plato:', error.message);
      return null;
    }
  }

  // Obtener platos por múltiples categorías
  async getDishesByCategories(categoryIds: string[]): Promise<Dish[]> {
    try {
      if (!categoryIds.length) {
        console.log('📭 No se proporcionaron categorías para filtrar');
        return [];
      }

      console.log('🔍 Obteniendo platos por categorías:', categoryIds);

      if (categoryIds.length <= 10) {
        const q = query(
          collection(db, DISHES_COLLECTION),
          where('categoryId', 'in', categoryIds),
          where('isAvailable', '==', true),
          orderBy('order', 'asc') // 🔥 CAMBIADO: ordenar por 'order'
        );

        const querySnapshot = await getDocs(q);
        const dishes: Dish[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          dishes.push({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            image: data.image || '',
            categoryId: data.categoryId || '',
            categoryName: data.categoryName || '',
            isAvailable: data.isAvailable ?? true,
            ingredients: data.ingredients || [],
            preparationTime: data.preparationTime || 15,
            isSpicy: data.isSpicy || false,
            isVegetarian: data.isVegetarian || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            orderCount: data.orderCount || 0,
            dishType: data.dishType || 'normal',
            order: data.order || 0
          } as Dish);
        });

        console.log(`✅ ${dishes.length} platos encontrados en ${categoryIds.length} categorías`);
        return dishes;
      } else {
        // ... código para lotes (similar pero con orderBy)
        const batches: string[][] = [];
        for (let i = 0; i < categoryIds.length; i += 10) {
          batches.push(categoryIds.slice(i, i + 10));
        }

        let allDishes: Dish[] = [];

        for (const batch of batches) {
          const q = query(
            collection(db, DISHES_COLLECTION),
            where('categoryId', 'in', batch),
            where('isAvailable', '==', true),
            orderBy('order', 'asc') // 🔥 CAMBIADO
          );

          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allDishes.push({
              id: doc.id,
              name: data.name || '',
              description: data.description || '',
              price: data.price || 0,
              image: data.image || '',
              categoryId: data.categoryId || '',
              categoryName: data.categoryName || '',
              isAvailable: data.isAvailable ?? true,
              ingredients: data.ingredients || [],
              preparationTime: data.preparationTime || 15,
              isSpicy: data.isSpicy || false,
              isVegetarian: data.isVegetarian || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate(),
              orderCount: data.orderCount || 0,
              dishType: data.dishType || 'normal',
              order: data.order || 0
            } as Dish);
          });
        }

        const uniqueDishes = Array.from(new Map(allDishes.map(dish => [dish.id, dish])).values());
        return uniqueDishes;
      }
    } catch (error: any) {
      console.error('❌ Error al obtener platos por categorías:', error.message);
      return [];
    }
  }

  // Agregar nuevo plato (CON ORDEN AUTOMÁTICO)
  async addDish(dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Dish | null> {
    try {
      console.log('➕ Intentando agregar plato:', dishData);

      if (!dishData.name || !dishData.categoryId) {
        throw new Error('Faltan datos requeridos: nombre y categoría');
      }

      // 🔥 Obtener el máximo orden actual para esta categoría
      const dishesInCategory = await this.getDishesByCategory(dishData.categoryId);
      const maxOrder = dishesInCategory.length > 0
        ? Math.max(...dishesInCategory.map(d => d.order || 0))
        : 0;

      const dishToSave = {
        name: dishData.name.trim(),
        description: (dishData.description || '').trim(),
        price: dishData.price || 0,
        image: dishData.image || '',
        categoryId: dishData.categoryId,
        categoryName: dishData.categoryName || '',
        isAvailable: dishData.isAvailable ?? true,
        isVegetarian: dishData.isVegetarian || false,
        isSpicy: dishData.isSpicy || false,
        preparationTime: dishData.preparationTime || 15,
        ingredients: dishData.ingredients || [],
        orderCount: 0,
        dishType: dishData.dishType || 'normal',
        order: maxOrder + 1, // 👈 NUEVO: asignar el siguiente orden
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('📤 Datos a guardar en Firebase:', dishToSave);

      const docRef = await addDoc(collection(db, DISHES_COLLECTION), dishToSave);

      console.log('✅ Plato creado con ID:', docRef.id);

      return {
        id: docRef.id,
        ...dishData,
        order: maxOrder + 1,
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Error al agregar plato:', error.message, error.stack);
      return null;
    }
  }

  // 🔥 NUEVO: Reordenar platos de una categoría
  async reorderDishes(categoryId: string, dishIds: string[]): Promise<boolean> {
    try {
      console.log('🔄 Reordenando platos de categoría:', categoryId);
      
      // Actualizar cada plato con su nuevo orden
      for (let i = 0; i < dishIds.length; i++) {
        const dishId = dishIds[i];
        await this.updateDish(dishId, { order: i + 1 });
      }
      
      console.log('✅ Platos reordenados correctamente');
      return true;
    } catch (error: any) {
      console.error('❌ Error al reordenar platos:', error.message);
      return false;
    }
  }

  // Actualizar plato (AHORA INCLUYE 'order')
  async updateDish(id: string, updates: Partial<Dish>): Promise<boolean> {
    try {
      const docRef = doc(db, DISHES_COLLECTION, id);

      console.log('📤 ACTUALIZANDO PLATO:', {
        id,
        updates,
        hasOrder: 'order' in updates,
        orderValue: updates.order
      });

      // Preparar datos para Firestore
      const dataToUpdate: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Asegurar que order sea número si viene
      if (dataToUpdate.order !== undefined) {
        dataToUpdate.order = Number(dataToUpdate.order);
        console.log('🎯 ORDER A GUARDAR:', dataToUpdate.order);
      }

      await updateDoc(docRef, dataToUpdate);

      console.log('✅ Plato actualizado en Firebase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Error al actualizar plato:', error.message);
      return false;
    }
  }

  // Eliminar plato
  async deleteDish(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, DISHES_COLLECTION, id);
      await deleteDoc(docRef);
      console.log('✅ Plato eliminado:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Error al eliminar plato:', error.message);
      return false;
    }
  }

  // Incrementar contador de órdenes
  async incrementOrderCount(dishId: string): Promise<void> {
    try {
      const dish = await this.getDishById(dishId);
      if (dish) {
        await updateDoc(doc(db, DISHES_COLLECTION, dishId), {
          orderCount: (dish.orderCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Contador incrementado para plato:', dishId);
      }
    } catch (error: any) {
      console.error('❌ Error al incrementar contador de órdenes:', error.message);
    }
  }

  // Buscar platos
  async searchDishes(queryText: string): Promise<Dish[]> {
    try {
      console.log('🔍 Buscando platos:', queryText);
      const allDishes = await this.getAllDishes();
      const lowerQuery = queryText.toLowerCase();

      const results = allDishes.filter(dish =>
        dish.name.toLowerCase().includes(lowerQuery) ||
        dish.description.toLowerCase().includes(lowerQuery) ||
        dish.ingredients?.some(ingredient =>
          ingredient.toLowerCase().includes(lowerQuery)
        )
      );

      console.log(`✅ ${results.length} resultados encontrados`);
      return results;
    } catch (error: any) {
      console.error('❌ Error al buscar platos:', error.message);
      return [];
    }
  }

  // Obtener platos por categoría (una sola categoría)
  async getDishesByCategory(categoryId: string): Promise<Dish[]> {
    try {
      console.log('🔍 Obteniendo platos por categoría:', categoryId);
      const q = query(
        collection(db, DISHES_COLLECTION),
        where('categoryId', '==', categoryId),
        where('isAvailable', '==', true),
        orderBy('order', 'asc') // 🔥 CAMBIADO: ordenar por 'order'
      );

      const querySnapshot = await getDocs(q);
      const dishes: Dish[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dishes.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          image: data.image || '',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          isAvailable: data.isAvailable ?? true,
          ingredients: data.ingredients || [],
          preparationTime: data.preparationTime || 15,
          isSpicy: data.isSpicy || false,
          isVegetarian: data.isVegetarian || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          orderCount: data.orderCount || 0,
          dishType: data.dishType || 'normal',
          order: data.order || 0
        } as Dish);
      });

      console.log(`✅ ${dishes.length} platos encontrados en categoría ${categoryId}`);
      return dishes;
    } catch (error: any) {
      console.error('❌ Error al obtener platos por categoría:', error.message);
      return [];
    }
  }

  // Filtrar platos
  async filterDishes(options: FilterOptions): Promise<Dish[]> {
    try {
      console.log('🔍 Filtrando platos con opciones:', options);

      let q = query(collection(db, DISHES_COLLECTION));
      const conditions = [];

      conditions.push(where('isAvailable', '==', true));

      if (options.categoryId) {
        conditions.push(where('categoryId', '==', options.categoryId));
      }

      // 🔥 Añadir orden por 'order' por defecto
      q = query(
        collection(db, DISHES_COLLECTION),
        ...conditions,
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const dishes: Dish[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dish: Dish = {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          image: data.image || '',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          isAvailable: data.isAvailable ?? true,
          ingredients: data.ingredients || [],
          preparationTime: data.preparationTime || 15,
          isSpicy: data.isSpicy || false,
          isVegetarian: data.isVegetarian || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          orderCount: data.orderCount || 0,
          dishType: data.dishType || 'normal',
          order: data.order || 0
        };

        let include = true;

        if (options.isVegetarian !== undefined && dish.isVegetarian !== options.isVegetarian) {
          include = false;
        }

        if (options.isSpicy !== undefined && dish.isSpicy !== options.isSpicy) {
          include = false;
        }

        if (options.minPrice !== undefined && dish.price < options.minPrice) {
          include = false;
        }

        if (options.maxPrice !== undefined && dish.price > options.maxPrice) {
          include = false;
        }

        if (include) {
          dishes.push(dish);
        }
      });

      if (options.sortBy) {
        dishes.sort((a, b) => {
          if (options.sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else if (options.sortBy === 'price') {
            return a.price - b.price;
          } else if (options.sortBy === 'popular') {
            return (b.orderCount || 0) - (a.orderCount || 0);
          } else if (options.sortBy === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });

        if (options.sortOrder === 'desc' && options.sortBy !== 'popular' && options.sortBy !== 'newest') {
          dishes.reverse();
        }
      }

      console.log(`✅ ${dishes.length} platos filtrados`);
      return dishes;
    } catch (error: any) {
      console.error('❌ Error al filtrar platos:', error.message);
      return [];
    }
  }

  // Obtener platos recomendados
  async getRecommendedDishes(limit: number = 4): Promise<Dish[]> {
    try {
      console.log('🔍 Obteniendo platos recomendados');
      const allDishes = await this.getAllDishes();

      const availableDishes = allDishes.filter(dish => dish.isAvailable);

      const recommended = availableDishes
        .sort((a, b) => {
          const popularityDiff = (b.orderCount || 0) - (a.orderCount || 0);
          if (popularityDiff !== 0) return popularityDiff;
          return (a.order || 0) - (b.order || 0);
        })
        .slice(0, limit);

      console.log(`✅ ${recommended.length} platos recomendados encontrados`);
      return recommended;
    } catch (error: any) {
      console.error('❌ Error al obtener platos recomendados:', error.message);
      return [];
    }
  }

  // Obtener categorías de platos
  async getCategoriesFromDishes(): Promise<Array<{ id: string, name: string, count: number }>> {
    try {
      const allDishes = await this.getAllDishes();
      const categories = new Map();

      allDishes.forEach(dish => {
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
    } catch (error: any) {
      console.error('❌ Error al obtener categorías de platos:', error.message);
      return [];
    }
  }
}

export const dishService = new DishService();