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
  // Obtener todos los platos
  async getAllDishes(): Promise<Dish[]> {
    try {
      console.log('🔍 Obteniendo platos de Firebase...');
      const q = query(collection(db, DISHES_COLLECTION), orderBy('createdAt', 'desc'));
      
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
          orderCount: data.orderCount || 0
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
          orderCount: data.orderCount || 0
        } as Dish;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Error al obtener plato:', error.message);
      return null;
    }
  }

  // NUEVO: Obtener platos por múltiples categorías
  async getDishesByCategories(categoryIds: string[]): Promise<Dish[]> {
    try {
      if (!categoryIds.length) {
        console.log('📭 No se proporcionaron categorías para filtrar');
        return [];
      }

      console.log('🔍 Obteniendo platos por categorías:', categoryIds);
      
      // Firestore 'in' soporta hasta 10 categorías por consulta
      // Si hay más de 10, necesitamos hacer múltiples consultas
      if (categoryIds.length <= 10) {
        // Consulta simple con 'in'
        const q = query(
          collection(db, DISHES_COLLECTION),
          where('categoryId', 'in', categoryIds),
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc')
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
            orderCount: data.orderCount || 0
          } as Dish);
        });
        
        console.log(`✅ ${dishes.length} platos encontrados en ${categoryIds.length} categorías`);
        return dishes;
      } else {
        // Si hay más de 10 categorías, dividimos en lotes de 10
        console.log('📦 Más de 10 categorías, dividiendo en lotes...');
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
            orderBy('createdAt', 'desc')
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
              orderCount: data.orderCount || 0
            } as Dish);
          });
        }
        
        // Eliminar duplicados por si acaso (aunque no debería haber)
        const uniqueDishes = Array.from(new Map(allDishes.map(dish => [dish.id, dish])).values());
        
        console.log(`✅ ${uniqueDishes.length} platos encontrados en ${categoryIds.length} categorías (${batches.length} lotes)`);
        return uniqueDishes;
      }
    } catch (error: any) {
      console.error('❌ Error al obtener platos por categorías:', error.message);
      return [];
    }
  }

  // Agregar nuevo plato
  async addDish(dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish | null> {
    try {
      console.log('➕ Intentando agregar plato:', dishData);
      
      // Validar que tengamos los datos necesarios
      if (!dishData.name || !dishData.categoryId) {
        throw new Error('Faltan datos requeridos: nombre y categoría');
      }
      
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('📤 Datos a guardar en Firebase:', dishToSave);
      
      const docRef = await addDoc(collection(db, DISHES_COLLECTION), dishToSave);
      
      console.log('✅ Plato creado con ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...dishData,
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Error al agregar plato:', error.message, error.stack);
      return null;
    }
  }

  // Actualizar plato
  async updateDish(id: string, updates: Partial<Dish>): Promise<boolean> {
    try {
      const docRef = doc(db, DISHES_COLLECTION, id);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Plato actualizado:', id);
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
        orderBy('createdAt', 'desc')
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
          orderCount: data.orderCount || 0
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
      
      // Filtrar por disponibilidad por defecto
      conditions.push(where('isAvailable', '==', true));
      
      if (options.categoryId) {
        conditions.push(where('categoryId', '==', options.categoryId));
      }
      
      if (conditions.length > 0) {
        q = query(collection(db, DISHES_COLLECTION), ...conditions);
      }
      
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
          orderCount: data.orderCount || 0
        };
        
        // Aplicar filtros adicionales en memoria
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
      
      // Ordenar
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
      
      // Filtrar platos disponibles
      const availableDishes = allDishes.filter(dish => dish.isAvailable);
      
      // Ordenar por popularidad (orderCount) y luego por los más nuevos
      const recommended = availableDishes
        .sort((a, b) => {
          // Primero por popularidad
          const popularityDiff = (b.orderCount || 0) - (a.orderCount || 0);
          if (popularityDiff !== 0) return popularityDiff;
          
          // Luego por más nuevos
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit);
      
      console.log(`✅ ${recommended.length} platos recomendados encontrados`);
      return recommended;
    } catch (error: any) {
      console.error('❌ Error al obtener platos recomendados:', error.message);
      return [];
    }
  }

  // Obtener categorías de platos (útil para contadores)
  async getCategoriesFromDishes(): Promise<Array<{id: string, name: string, count: number}>> {
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