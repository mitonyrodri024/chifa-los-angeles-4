// src/app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { orderService } from '@/lib/firebase/orderService';
import { categoryService } from '@/lib/firebase/categoryService';
import {
  ArrowLeft, ShoppingCart, Truck, Store, Plus, Minus,
  Trash2, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  dishId: string;
  dishName: string;
  price: number;
  basePrice?: number;
  quantity: number;
  image?: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  preparationTime?: number;
  dishType?: 'sopa' | 'menu' | 'normal';
  selectedSpecialOption?: {
    type: string;
    label: string;
    price: number;
  };
  hasSpecialOption?: boolean;
  uniqueId?: string;
}

interface Category {
  id: string;
  name: string;
  specialOptions?: Array<{
    type: string;
    label: string;
    price: number;
    description?: string;
  }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyCartMessage, setShowEmptyCartMessage] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        let parsed = JSON.parse(savedCart);
        parsed = parsed.map((item: any) => ({
          ...item,
          uniqueId: item.uniqueId || `${item.dishId}_${Date.now()}_${Math.random()}`
        }));
        setCartItems(parsed);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
    setIsLoadingCart(false);
  }, []);

  // Verificar si el carrito está vacío
  useEffect(() => {
    if (!isLoadingCart && !isLoadingCategories && cartItems.length === 0) {
      setShowEmptyCartMessage(true);
    } else {
      setShowEmptyCartMessage(false);
    }
  }, [cartItems, isLoadingCart, isLoadingCategories]);

  const getItemCategory = (item: CartItem): Category | undefined => {
    return categories.find(c => c.id === item.categoryId);
  };

  const hasSpecialOptions = (item: CartItem): boolean => {
    const category = getItemCategory(item);
    return !!(category?.specialOptions && category.specialOptions.length > 0);
  };

  const getSpecialOptions = (item: CartItem) => {
    const category = getItemCategory(item);
    return category?.specialOptions || [];
  };

  const handleSpecialOptionChange = (uniqueId: string, option: any) => {
    const updatedCart = cartItems.map(item => {
      if ((item.uniqueId || item.dishId) === uniqueId) {
        let basePrice = item.basePrice;

        if (!basePrice) {
          if (item.selectedSpecialOption) {
            basePrice = item.price - item.selectedSpecialOption.price;
          } else {
            basePrice = item.price;
          }
        }

        const newPrice = basePrice + option.price;

        return {
          ...item,
          selectedSpecialOption: option,
          price: newPrice,
          basePrice: basePrice,
          hasSpecialOption: true
        };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (uniqueId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(uniqueId);
      return;
    }
    const updatedCart = cartItems.map(item =>
      (item.uniqueId || item.dishId) === uniqueId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (uniqueId: string) => {
    const updatedCart = cartItems.filter(item => (item.uniqueId || item.dishId) !== uniqueId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let sopaSurcharge = 0;
    let menuSurcharge = 0;
    let specialOptionsTotal = 0;

    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;

      if (orderType === 'delivery' && !hasSpecialOptions(item)) {
        if (item.dishType === 'sopa') {
          sopaSurcharge += 0.5 * item.quantity;
        } else if (item.dishType === 'menu') {
          menuSurcharge += 1.0 * item.quantity;
        }
      }

      if (item.selectedSpecialOption) {
        specialOptionsTotal += item.selectedSpecialOption.price * item.quantity;
      }
    });

    const totalSurcharge = sopaSurcharge + menuSurcharge;

    return {
      subtotal,
      sopaSurcharge,
      menuSurcharge,
      specialOptionsTotal,
      totalSurcharge,
      total: subtotal + totalSurcharge
    };
  };

  const totals = calculateTotal();

  const getItemSurcharge = (item: CartItem) => {
    if (orderType !== 'delivery' || hasSpecialOptions(item)) return 0;
    if (item.dishType === 'sopa') return 0.5 * item.quantity;
    if (item.dishType === 'menu') return 1.0 * item.quantity;
    return 0;
  };

  const getItemTotalPrice = (item: CartItem) => {
    return item.price * item.quantity + getItemSurcharge(item);
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      setError('Por favor, inicia sesión para continuar');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Por favor, ingresa una dirección de entrega');
      return;
    }

    const itemsWithoutOption = cartItems.filter(item =>
      hasSpecialOptions(item) && !item.selectedSpecialOption
    );

    if (itemsWithoutOption.length > 0) {
      setError('Debes seleccionar una opción para todos los platos');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = cartItems.map(item => {
        let surcharge = 0;

        if (orderType === 'delivery' && !hasSpecialOptions(item)) {
          if (item.dishType === 'sopa') surcharge = 0.5 * item.quantity;
          if (item.dishType === 'menu') surcharge = 1.0 * item.quantity;
        }

        return {
          dishId: item.dishId || '',
          dishName: item.dishName || '',
          quantity: item.quantity || 0,
          price: item.price || 0,
          basePrice: item.basePrice || item.price || 0,
          dishType: item.dishType || 'normal',
          surcharge: surcharge || 0,
          selectedSpecialOption: item.selectedSpecialOption || null,
          categoryId: item.categoryId || ''
        };
      });

      // 🔥 CONSTRUIR orderData con valores por defecto para TODO
      const orderData: any = {
        userId: user.uid || '',
        userName: user.displayName || 'Cliente',
        userEmail: user.email || '',
        items: orderItems,
        subtotal: totals.subtotal || 0,
        surcharges: {
          sopa: totals.sopaSurcharge || 0,
          menu: totals.menuSurcharge || 0,
          special: totals.specialOptionsTotal || 0,
          total: totals.totalSurcharge || 0
        },
        total: totals.total || 0,
        status: 'pending',
        type: orderType || 'pickup',
      };

      // 🔥 AGREGAR CAMPOS OPCIONALES SOLO SI EXISTEN Y NO ESTÁN VACÍOS
      if (deliveryAddress && deliveryAddress.trim()) {
        orderData.deliveryAddress = deliveryAddress.trim();
      }

      if (notes && notes.trim()) {
        orderData.notes = notes.trim();
      }

      // 🔥 CONSTRUIR MENSAJE DE WHATSAPP
      const itemsText = orderItems
        .map(item => {
          let itemLine = `  • ${item.dishName} x${item.quantity} = S/ ${(item.price * item.quantity).toFixed(2)}`;
          if (item.surcharge > 0) {
            itemLine += ` (+S/ ${item.surcharge.toFixed(2)} por ${item.dishType})`;
          }
          if (item.selectedSpecialOption) {
            itemLine += `\n    └─ ✨ ${item.selectedSpecialOption.label}: +S/ ${(item.selectedSpecialOption.price * item.quantity).toFixed(2)}`;
          }
          return itemLine;
        })
        .join('\n');

      const deliveryText = orderType === 'delivery'
        ? `🚚 *Delivery a:* ${deliveryAddress.trim()}\n   (El costo de envío se paga al llegar)`
        : `🏪 *Recojo en tienda*`;

      const surchargeText = totals.totalSurcharge > 0
        ? `💰 *Cargos adicionales:* S/ ${totals.totalSurcharge.toFixed(2)}\n   (Sopas: S/ ${totals.sopaSurcharge.toFixed(2)} | Menús: S/ ${totals.menuSurcharge.toFixed(2)})`
        : '';

      const specialText = totals.specialOptionsTotal > 0
        ? `✨ *Opciones especiales:* S/ ${totals.specialOptionsTotal.toFixed(2)}`
        : '';

      const notesText = notes.trim() ? `\n📝 *Notas:* ${notes.trim()}` : '';

      // Crear el mensaje base (sin ID)
      const mensajeBase = [
        `🍜 *NUEVO PEDIDO - Chifa Los Angeles*`,
        `─────────────────────`,
        `👤 *Cliente:* ${user.displayName || 'Cliente'}`,
  
        `─────────────────────`,
        `🛒 *Pedido:*`,
        itemsText,
        `─────────────────────`,
        deliveryText,
        specialText ? `─────────────────────\n${specialText}` : '',
        surchargeText ? `─────────────────────\n${surchargeText}` : '',
        `─────────────────────`,
        `💰 *Subtotal:* S/ ${totals.subtotal.toFixed(2)}`,
        `✅ *TOTAL: S/ ${totals.total.toFixed(2)}*`,
        notesText,
      ].filter(Boolean).join('\n');

      // Abrir WhatsApp INMEDIATAMENTE (acción del usuario)
      const whatsappUrlBase = `https://wa.me/51976039735?text=${encodeURIComponent(mensajeBase)}`;
      const whatsappWindow = window.open(whatsappUrlBase, '_blank');

      // Crear el pedido
      const newOrder = await orderService.createOrder(orderData);

      if (newOrder) {
        setOrderId(newOrder.id);
        
        // Actualizar la ventana de WhatsApp con el ID (si aún está abierta)
        if (whatsappWindow && !whatsappWindow.closed) {
          const mensajeCompleto = mensajeBase + `\n─────────────────────\n🆔 *ID Pedido:* ${newOrder.id}`;
          const nuevaUrl = `https://wa.me/51976039735?text=${encodeURIComponent(mensajeCompleto)}`;
          whatsappWindow.location.href = nuevaUrl;
        }
        
        setShowSuccess(true);
        setCartItems([]);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        setError('Error al crear el pedido. Intenta nuevamente.');
      }
    } catch (error: any) {
      console.error('Error al procesar pedido:', error);
      setError(error.message || 'Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCart || isLoadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-chifa-red animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (showEmptyCartMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8">
              Parece que aún no has agregado ningún plato a tu carrito.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-chifa-red !text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ver Menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pedido Confirmado!</h1>
            <p className="text-gray-600 text-lg mb-2">Tu pedido ha sido recibido exitosamente.</p>
            <p className="text-gray-500 mb-4">Hemos enviado los detalles a WhatsApp</p>
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg font-mono text-sm mb-6">
              ID: {orderId}
            </div>
            <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{orderType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
                </div>
                {totals.totalSurcharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recargos:</span>
                    <span className="font-medium">S/ {totals.totalSurcharge.toFixed(2)}</span>
                  </div>
                )}
                {totals.specialOptionsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Opciones especiales:</span>
                    <span className="font-medium">S/ {totals.specialOptionsTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-chifa-red">S/ {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/menu"
                className="px-6 py-3 bg-chifa-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Seguir Comprando
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ir al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Finalizar Pedido</h1>
                <p className="text-gray-600">Revisa tu pedido y completa la información</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Items en carrito</div>
              <div className="text-2xl font-bold text-chifa-red">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Tu Carrito
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Vaciar carrito
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const itemSurcharge = getItemSurcharge(item);
                  const itemTotal = getItemTotalPrice(item);
                  const uniqueId = item.uniqueId || item.dishId;
                  const hasOptions = hasSpecialOptions(item);
                  const specialOptions = hasOptions ? getSpecialOptions(item) : [];

                  return (
                    <div key={uniqueId} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{item.dishName}</h3>

                              {/* 🔥 PRECIO BASE - NUNCA CAMBIA */}
                              <p className="text-chifa-red font-bold text-lg">
                                S/ {(item.basePrice || item.price).toFixed(2)}
                              </p>

                              {!hasOptions && item.dishType && item.dishType !== 'normal' && (
                                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                  item.dishType === 'sopa'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {item.dishType === 'sopa' ? '🍲 Sopa' : '🍱 Menú'}
                                </span>
                              )}
                            </div>

                            <div className="text-right">
                              {/* 🔥 PRECIO TOTAL DEL ITEM (base + opción + recargos) */}
                              <div className="font-bold text-gray-900">S/ {itemTotal.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}</div>

                              {itemSurcharge > 0 && orderType === 'delivery' && (
                                <div className="text-xs text-orange-600 mt-1">
                                  +S/ {itemSurcharge.toFixed(2)} por {item.dishType}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* SECCIÓN DE OPCIONES OBLIGATORIAS */}
                          {hasOptions && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-medium text-gray-700">
                                  ¿Con qué deseas tu pedido?
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-semibold">
                                  Obligatorio
                                </span>
                              </div>

                              <div className="space-y-3">
                                {specialOptions.map((option, idx) => {
                                  const totalPrice = (item.basePrice || item.price) + option.price;
                                  const isSelected = item.selectedSpecialOption?.type === option.type;

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => handleSpecialOptionChange(uniqueId, option)}
                                      className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                                        isSelected
                                          ? 'border-[#EC1F25] bg-red-50 ring-2 ring-[#EC1F25] ring-opacity-20'
                                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            isSelected
                                              ? 'border-[#EC1F25] bg-[#EC1F25]'
                                              : 'border-gray-300'
                                          }`}>
                                            {isSelected && (
                                              <span className="text-white text-xs">✓</span>
                                            )}
                                          </div>
                                          <div>
                                            <span className={`font-medium ${
                                              isSelected ? 'text-[#EC1F25]' : 'text-gray-900'
                                            }`}>
                                              {option.label}
                                            </span>
                                            {option.description && (
                                              <span className="text-xs text-gray-500 ml-2">
                                                ({option.description})
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="font-bold text-[#EC1F25]">
                                            +S/ {option.price.toFixed(2)}
                                          </span>
                                          <div className="text-xs text-gray-500">
                                            Total: S/ {totalPrice.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {!item.selectedSpecialOption && (
                                <p className="mt-3 text-xs text-red-600 flex items-center gap-1">
                                  <span>⚠️</span>
                                  Debes seleccionar una opción para continuar
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(uniqueId, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(uniqueId, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(uniqueId)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    orderType === 'pickup'
                      ? 'border-chifa-red bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      orderType === 'pickup' ? 'bg-chifa-red text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Recoger en Tienda</div>
                      <div className="text-sm text-gray-600">Sin costo adicional</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    orderType === 'delivery'
                      ? 'border-chifa-red bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      orderType === 'delivery' ? 'bg-chifa-red text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Delivery</div>
                      <div className="text-sm text-gray-600">Se paga al llegar</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Sopas: +S/0.50 | Menús: +S/1.00
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {orderType === 'delivery' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Entrega <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chifa-red focus:border-transparent"
                    placeholder="Ingresa tu dirección completa..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chifa-red focus:border-transparent"
                  placeholder="Instrucciones especiales, alergias, etc..."
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Resumen</h2>
                </div>
                <div className="p-6">
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Cliente</div>
                    {user ? (
                      <>
                        <div className="font-bold text-gray-900">{user.displayName || 'Usuario'}</div>
                      </>
                    ) : (
                      <p className="text-gray-600 font-medium">No has iniciado sesión</p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">S/ {totals.subtotal.toFixed(2)}</span>
                    </div>

                    {totals.sopaSurcharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">🍲 Recargo sopas</span>
                        <span className="font-medium">S/ {totals.sopaSurcharge.toFixed(2)}</span>
                      </div>
                    )}

                    {totals.menuSurcharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">🍱 Recargo menús</span>
                        <span className="font-medium">S/ {totals.menuSurcharge.toFixed(2)}</span>
                      </div>
                    )}

                    {totals.specialOptionsTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">✨ Opciones especiales</span>
                        <span className="font-medium">S/ {totals.specialOptionsTotal.toFixed(2)}</span>
                      </div>
                    )}

                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-sm text-gray-500 italic">
                        <span>Delivery</span>
                        <span>Por pagar</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-chifa-red">S/ {totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={cartItems.length === 0 || isSubmitting || (orderType === 'delivery' && !deliveryAddress.trim())}
                    className="w-full py-4 bg-chifa-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                    ) : (
                      <><CheckCircle className="w-5 h-5" /> Confirmar Pedido</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}