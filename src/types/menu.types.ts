// src/types/menu.types.ts

// Tipo para opciones especiales de categoría
export type SpecialOptionType = 'con_sopa' | 'con_wantan' | string;

export interface SpecialOptionConfig {
  type: SpecialOptionType;
  label: string;
  price: number;
  description?: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Base64 string
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  ingredients?: string[];
  preparationTime?: number; // en minutos
  isSpicy?: boolean;
  isVegetarian?: boolean;
  createdAt: Date;
  updatedAt?: Date;
  orderCount?: number; // Para popularidad
  order?: number; // 👈 AGREGAR ESTO

  // CAMPOS PARA EL COBRO ADICIONAL EN DELIVERY
  dishType?: 'sopa' | 'menu' | 'normal'; // Tipo de plato
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  dishCount: number;
  icon?: string;
  color?: string;
  order?: number;
  images?: string[]; // Array de imágenes Base64
  createdAt?: Date;
  updatedAt?: Date;
  // NUEVO: Campos para opciones especiales
  hasSpecialOptions?: boolean;
  specialOptions?: SpecialOptionConfig[];
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  surcharges?: {
    sopa?: number;
    menu?: number;
    total?: number;
  };
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  type: 'pickup' | 'delivery';
  deliveryAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  notes?: string;
  dishType?: 'sopa' | 'menu' | 'normal';
  surcharge?: number; // Sobrecargo aplicado a este item
  // NUEVO: Opción especial seleccionada
  selectedSpecialOption?: {
    type: string;
    label: string;
    price: number;
  };
}

export interface CartItem {
  dishId: string;
  quantity: number;
  notes?: string;
  dishName: string;
  price: number;
  basePrice?: number; // Precio sin opción especial
  image?: string;
  categoryName: string;
  description?: string;
  preparationTime?: number;
  dishType?: 'sopa' | 'menu' | 'normal';
  // NUEVO: Opción especial seleccionada
  selectedSpecialOption?: {
    type: string;
    label: string;
    price: number;
  };
  hasSpecialOption?: boolean;
}

export interface FilterOptions {
  categoryId?: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'popular' | 'newest';
  sortOrder?: 'asc' | 'desc';
}