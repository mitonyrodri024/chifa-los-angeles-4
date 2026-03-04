'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { orderService } from '@/lib/firebase/orderService';
import { ArrowLeft, ShoppingCart, Truck, Store, Plus, Minus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setIsLoadingCart(false);
  }, []);

  // ✅ ELIMINADO: Redirección automática al login
  // useEffect(() => {
  //   if (!user) {
  //     router.push('/login?redirect=/checkout');
  //   }
  // }, [user, router]);

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0 && !showSuccess) {
      router.push('/');
    }
  }, [cartItems, showSuccess, isLoadingCart, router]);

  // Actualizar cantidad
  const updateQuantity = (dishId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(dishId);
      return;
    }
    const updatedCart = cartItems.map(item =>
      item.dishId === dishId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Eliminar item
  const removeItem = (dishId: string) => {
    const updatedCart = cartItems.filter(item => item.dishId !== dishId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Vaciar carrito
  const clearCart = () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Calcular total
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? 5 : 0;
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  };

  const totals = calculateTotal();

  // Procesar pedido
  const handleSubmitOrder = async () => {
    if (!user) {
      setError('Por favor, inicia sesión para continuar');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Por favor, ingresa una dirección de entrega');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = cartItems.map(item => ({
        dishId: item.dishId,
        dishName: item.dishName,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        userId: user.uid,
        userName: user.displayName || 'Cliente',
        userEmail: user.email || '',
        items: orderItems,
        total: totals.total,
        status: 'pending' as const,
        type: orderType,
        ...(orderType === 'delivery' && { deliveryAddress: deliveryAddress.trim() }),
        ...(notes.trim() && { notes: notes.trim() }),
      };

      const newOrder = await orderService.createOrder(orderData);

      if (newOrder) {
        setOrderId(newOrder.id);
        setShowSuccess(true);
        setCartItems([]);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));

        // Armar mensaje de WhatsApp
        const itemsText = orderItems
          .map(item => `  • ${item.dishName} x${item.quantity} = S/ ${(item.price * item.quantity).toFixed(2)}`)
          .join('\n');

        const deliveryText = orderType === 'delivery'
          ? `🚚 *Delivery a:* ${deliveryAddress.trim()}`
          : `🏪 *Recojo en tienda*`;

        const notesText = notes.trim() ? `\n📝 *Notas:* ${notes.trim()}` : '';

        const mensaje = [
          `🍜 *NUEVO PEDIDO - Chifa Los Angeles*`,
          `─────────────────────`,
          `👤 *Cliente:* ${user.displayName || 'Cliente'}`,
          `📧 *Email:* ${user.email}`,
          `─────────────────────`,
          `🛒 *Pedido:*`,
          itemsText,
          `─────────────────────`,
          deliveryText,
          `─────────────────────`,
          `💰 *Subtotal:* S/ ${totals.subtotal.toFixed(2)}`,
          orderType === 'delivery' ? `🛵 *Delivery:* S/ ${totals.deliveryFee.toFixed(2)}` : '',
          `✅ *TOTAL: S/ ${totals.total.toFixed(2)}*`,
          notesText,
          `─────────────────────`,
          `🆔 *ID Pedido:* ${newOrder.id}`,
        ].filter(Boolean).join('\n');

        const whatsappUrl = `https://wa.me/51930889106?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');

        setTimeout(() => {
          router.push(`/orders/${newOrder.id}`);
        }, 5000);
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

  // ✅ MODIFICADO: Ya no redirige al login, solo muestra loading mientras carga el carrito
  if (isLoadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-chifa-red animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu carrito...</p>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-chifa-red">S/ {totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium text-green-600">Pendiente de preparación</span>
                </div>
              </div>
            </div>
            <p className="text-gray-500 mb-6">Redirigiendo a los detalles del pedido en 5 segundos...</p>
            <div className="flex justify-center gap-4">
              <Link href="/" className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Volver al Menú
              </Link>
              <Link href={`/orders/${orderId}`} className="px-6 py-3 bg-chifa-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Ver Detalles del Pedido
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
        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carrito */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Tu Carrito
                  </h2>
                  <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                    <Trash2 className="w-4 h-4" />
                    Vaciar carrito
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.dishId} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.dishName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{item.dishName}</h3>
                            <p className="text-chifa-red font-bold text-lg">S/ {item.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">S/ {(item.price * item.quantity).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.dishId, item.quantity - 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.dishId, item.quantity + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.dishId)} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipo de entrega */}
            <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${orderType === 'pickup' ? 'border-chifa-red bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${orderType === 'pickup' ? 'bg-chifa-red text-white' : 'bg-gray-100 text-gray-600'}`}>
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
                  className={`p-4 border-2 rounded-xl text-left transition-all ${orderType === 'delivery' ? 'border-chifa-red bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${orderType === 'delivery' ? 'bg-chifa-red text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Delivery</div>
                      <div className="text-sm text-gray-600">+ S/ 5.00 de envío</div>
                    </div>
                  </div>
                </button>
              </div>

              {orderType === 'delivery' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega *</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chifa-red focus:border-transparent"
                    placeholder="Ingresa tu dirección completa para la entrega..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales (opcional)</label>
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

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Resumen del Pedido</h2>
                </div>
                <div className="p-6">
                  {/* ✅ MOSTRAR DATOS DEL USUARIO SOLO SI EXISTE */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Cliente</div>
                    {user ? (
                      <>
                        <div className="font-bold text-gray-900">{user.displayName || 'Usuario'}</div>
                        <div className="text-sm text-gray-600">{user.email || ''}</div>
                      </>
                    ) : (
                      <div className="text-gray-600">
                        <p>No has iniciado sesión</p>
                        <p className="text-xs mt-1">Necesitarás iniciar sesión para confirmar el pedido</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">S/ {totals.subtotal.toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo de envío</span>
                        <span className="font-medium">S/ {totals.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-chifa-red">S/ {totals.total.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {orderType === 'delivery' ? 'Incluye delivery' : 'Recoger en tienda'}
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

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">Al confirmar, aceptas nuestros términos y condiciones</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Tiempo estimado: {orderType === 'delivery' ? '30-45 min' : '15-20 min'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h4>
                <p className="text-blue-700 text-sm">
                  Llama al <a href="tel:+51999123456" className="font-bold">+51 999 123 456</a> para asistencia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}