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
  images?: string[]; // ← NUEVO: Array de imágenes Base64
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  items: OrderItem[];
  total: number;
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
}

export interface CartItem {
  dishId: string;
  quantity: number;
  notes?: string;
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