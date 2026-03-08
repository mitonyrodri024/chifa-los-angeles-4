// lib/firebase/categoryService.ts
'use client';

import { Category } from '@/types/menu.types';
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
  writeBatch
} from 'firebase/firestore';

const CATEGORIES_COLLECTION = 'categories';

export class CategoryService {
  // Obtener todas las categorías
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('📦 Obteniendo categorías desde Firebase...');
      const q = query(collection(db, CATEGORIES_COLLECTION));
      
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📁 Categoría encontrada: ${doc.id}`, {
          name: data.name,
          imagesCount: data.images?.length || 0,
          hasImages: !!data.images
        });
        
        categories.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          isActive: data.isActive ?? true,
          dishCount: data.dishCount || 0,
          icon: data.icon || '🍽️',
          color: data.color || '#DC2626',
          order: data.order || 0,
          images: data.images || [], // ✅ CAMPO IMAGES AGREGADO AQUÍ
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      
      // Ordenar por order
      return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      return [];
    }
  }

  // Obtener categorías activas
  async getActiveCategories(): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories
        .filter(category => category.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('❌ Error al obtener categorías activas:', error);
      return [];
    }
  }

  // Obtener categoría por ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📁 Categoría por ID ${id}:`, {
          name: data.name,
          imagesCount: data.images?.length || 0
        });
        
        return {
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          isActive: data.isActive ?? true,
          dishCount: data.dishCount || 0,
          icon: data.icon || '🍽️',
          color: data.color || '#DC2626',
          order: data.order || 0,
          images: data.images || [], // ✅ CAMPO IMAGES AGREGADO AQUÍ
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error al obtener categoría:', error);
      return null;
    }
  }

  // Obtener categorías con conteo de platos
  async getCategoriesWithCount(): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories();
      
      return categories.map(category => ({
        ...category,
        dishCount: category.dishCount || 0,
      }));
    } catch (error) {
      console.error('❌ Error al obtener categorías con conteo:', error);
      return [];
    }
  }

  // Agregar nueva categoría
  async addCategory(categoryData: Omit<Category, 'id' | 'dishCount' | 'createdAt' | 'updatedAt'>): Promise<Category | null> {
    try {
      console.log('➕ Intentando agregar categoría:', {
        name: categoryData.name,
        imagesCount: categoryData.images?.length || 0
      });
      
      // Obtener el siguiente orden
      const categories = await this.getAllCategories();
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.order || 0)) 
        : 0;
      
      const categoryToSave = {
        name: categoryData.name,
        description: categoryData.description || '',
        isActive: categoryData.isActive ?? true,
        dishCount: 0,
        icon: categoryData.icon || '🍽️',
        color: categoryData.color || '#DC2626',
        order: maxOrder + 1,
        images: categoryData.images || [], // ✅ GUARDAR IMÁGENES
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('📤 Datos a guardar:', {
        name: categoryToSave.name,
        imagesCount: categoryToSave.images.length
      });
      
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryToSave);
      
      console.log('✅ Categoría creada con ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...categoryData,
        dishCount: 0,
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('❌ Error al agregar categoría:', error);
      console.error('Error details:', error.message, error.stack);
      return null;
    }
  }

  // Actualizar categoría
  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      
      console.log(`✏️ Actualizando categoría ${id}:`, {
        updates: Object.keys(updates),
        hasImages: 'images' in updates,
        imagesCount: updates.images?.length || 0
      });
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Categoría actualizada');
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar categoría:', error);
      return false;
    }
  }

  // Eliminar categoría
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Importar dishService dinámicamente para verificar platos
      const { dishService } = await import('./dishService');
      const dishes = await dishService.getAllDishes();
      const dishesInCategory = dishes.filter(dish => dish.categoryId === id);
      
      if (dishesInCategory.length > 0) {
        return { 
          success: false, 
          message: `No se puede eliminar la categoría. Tiene ${dishesInCategory.length} plato(s) asociado(s).` 
        };
      }
      
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      await deleteDoc(docRef);
      
      // Reordenar las categorías restantes
      await this.reorderAfterDelete();
      
      return { success: true, message: 'Categoría eliminada exitosamente' };
    } catch (error) {
      console.error('❌ Error al eliminar categoría:', error);
      return { success: false, message: 'Error al eliminar la categoría' };
    }
  }

  // Cambiar estado activo/inactivo
  async toggleCategoryStatus(id: string): Promise<boolean> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) return false;
      
      return await this.updateCategory(id, { isActive: !category.isActive });
    } catch (error) {
      console.error('❌ Error al cambiar estado de categoría:', error);
      return false;
    }
  }

  // Reordenar categorías
  async reorderCategories(orderedIds: string[]): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      
      orderedIds.forEach((categoryId, index) => {
        const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
        batch.update(docRef, {
          order: index + 1,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      console.log('✅ Categorías reordenadas');
      return true;
    } catch (error) {
      console.error('❌ Error al reordenar categorías:', error);
      return false;
    }
  }

  // Reordenar después de eliminar
  private async reorderAfterDelete(): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      const sortedCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const batch = writeBatch(db);
      
      sortedCategories.forEach((category, index) => {
        const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
        batch.update(docRef, {
          order: index + 1,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      console.log('✅ Categorías reordenadas después de eliminar');
    } catch (error) {
      console.error('❌ Error al reordenar después de eliminar:', error);
    }
  }

  // Actualizar contador de platos para una categoría
  async updateCategoryDishCount(categoryId: string, change: number): Promise<void> {
    try {
      const category = await this.getCategoryById(categoryId);
      if (category) {
        const newCount = (category.dishCount || 0) + change;
        await this.updateCategory(categoryId, { dishCount: Math.max(0, newCount) });
      }
    } catch (error) {
      console.error('❌ Error al actualizar contador de categoría:', error);
    }
  }
}

export const categoryService = new CategoryService();