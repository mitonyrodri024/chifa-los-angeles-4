// src/lib/firebase/orderService.ts
'use client';

import { Order, OrderItem } from '@/types/menu.types';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { dishService } from './dishService';

const ORDERS_COLLECTION = 'orders';

export class OrderService {
  // Crear nueva orden
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      // Calcular total
      const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderToSave = {
        ...orderData,
        total,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderToSave);
      
      // Incrementar contadores de popularidad para cada plato
      for (const item of orderData.items) {
        await dishService.incrementOrderCount(item.dishId);
      }
      
      return {
        id: docRef.id,
        ...orderData,
        total,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error al crear orden:', error);
      return null;
    }
  }

  // Obtener órdenes por usuario (TODO LOCALMENTE, sin índice compuesto)
  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      // Obtener todas las órdenes
      const allOrders = await this.getAllOrders();
      
      // Filtrar localmente por usuario
      return allOrders.filter(order => order.userId === userId);
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return [];
    }
  }

  // Obtener todas las órdenes (admin)
  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION));
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order);
      });
      
      // Ordenar localmente por fecha descendente
      return orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error al obtener todas las órdenes:', error);
      return [];
    }
  }

  // Obtener orden por ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener orden:', error);
      return null;
    }
  }

  // Actualizar estado de orden
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      
      return true;
    } catch (error) {
      console.error('Error al actualizar estado de orden:', error);
      return false;
    }
  }

  // Obtener estadísticas (TODO LOCALMENTE)
  async getOrderStats() {
    try {
      const orders = await this.getAllOrders();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersToday = orders.filter(order => 
        order.createdAt >= today
      );
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      return {
        totalOrders: orders.length,
        ordersToday: ordersToday.length,
        totalRevenue,
        avgOrderValue,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        preparingOrders: orders.filter(o => o.status === 'preparing').length,
        readyOrders: orders.filter(o => o.status === 'ready').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }

  // Obtener órdenes por estado (TODO LOCALMENTE)
  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const allOrders = await this.getAllOrders();
      return allOrders
        .filter(order => order.status === status)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error al obtener órdenes por estado:', error);
      return [];
    }
  }
}

// Instancia singleton
export const orderService = new OrderService();