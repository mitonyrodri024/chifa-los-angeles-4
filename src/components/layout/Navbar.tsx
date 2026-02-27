'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, User, Phone, MapPin, Clock, ChevronDown, LogOut, Plus, Tag } from 'lucide-react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Carrito: cantidad total de items desde localStorage
  const [cartCount, setCartCount] = useState(0);

  const { user, loading } = useAuthContext();
  const { logout } = useAuth();
  const router = useRouter();

  // Leer carrito del localStorage y escuchar cambios
  const syncCart = () => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const items: { quantity: number }[] = JSON.parse(saved);
        setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  // Formatear nombre para mostrar: "ANTONI .R"
  const formatUserName = (fullName: string) => {
    if (!fullName) return 'USUARIO';
    const names = fullName.trim().split(' ');
    if (names.length === 0) return 'USUARIO';
    const firstName = names[0].toUpperCase();
    const lastNameInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() + '.' : '';
    return `${firstName} ${lastNameInitial}`.trim();
  };

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    const names = user.displayName.trim().split(' ');
    if (names.length === 0) return 'U';
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
    return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
  };

  useEffect(() => {
    setIsClient(true);
    syncCart();

    // Escuchar evento personalizado de actualización del carrito
    window.addEventListener('cartUpdated', syncCart);
    // También escuchar storage para cambios desde otras pestañas
    window.addEventListener('storage', syncCart);

    return () => {
      window.removeEventListener('cartUpdated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !isUserMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.user-button')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isClient, isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleUserMenuToggle = () => {
    if (user) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      router.push('/login');
    }
  };

  const handleCartClick = () => {
    if (!user) {
      alert('Por favor, inicia sesión para ver tu carrito');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  // Botón del carrito reutilizable
  const CartButton = () => (
    <button
      onClick={handleCartClick}
      className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors group"
      aria-label="Ver carrito"
    >
      <ShoppingCart className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#FFF100] text-[#EC1F25] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );

  // Versión de carga / SSR
  if (!isClient || loading) {
    return (
      <>
        <div className="hidden lg:block bg-[#35363A] border-b border-[#2A2B2E]">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+51999123456" className="font-medium">+51 999 123 456</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Jr. Ayacucho 1478 / Cajamarca</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Abierto: 11:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <header className="sticky top-0 z-50 w-full bg-[#EC1F25] py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-12 h-12 md:w-14 md:h-14">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center shadow-lg">
                    <Image src="/logo/logo.png" alt="Chifa Los Angeles Logo" width={56} height={56} className="object-contain" />
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
                    <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">CHIFA</span>{' '}
                    <span className="text-yellow-300 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">LOS ANGELES</span>
                  </h1>
                  <p className="text-xs md:text-sm text-white/90 font-medium hidden sm:block animate-pulse">
                    🥢 Auténtica cocina china · ¡La sazón que pruebes! 🥢
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <CartButton />
                <div className="flex items-center gap-2 p-2 pl-3 rounded-lg bg-white/20">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <User className="w-4 h-4 text-[#EC1F25]" />
                  </div>
                  <span className="font-medium text-white">Cargando...</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      {/* Barra de contacto - solo desktop */}
      <div className="hidden lg:block bg-[#35363A] border-b border-[#2A2B2E]">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 hover:text-[#FFF100] transition-colors duration-300">
                <Phone className="w-4 h-4" />
                <a href="tel:+51999123456" className="font-medium">+51 999 123 456</a>
              </div>
              <div className="flex items-center gap-2 hover:text-[#FFF100] transition-colors duration-300">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Jr. Ayacucho 1478 / Cajamarca</span>
              </div>
            </div>
            <div className="flex items-center gap-2 hover:text-[#FFF100] transition-colors duration-300">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Abierto: 11:00 AM - 11:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-[#EC1F25] shadow-xl py-2' : 'bg-[#EC1F25] py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <div className="w-full h-full bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <Image src="/logo/logo.png" alt="Chifa Los Angeles Logo" width={56} height={56} className="object-contain p-1" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
                  <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">CHIFA</span>{' '}
                  <span className="text-yellow-300 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">LOS ANGELES</span>
                </h1>
                <p className="text-xs md:text-sm text-white/90 font-medium hidden sm:block">
                  🥢 Auténtica cocina china · ¡La sazón que pruebes! 🥢
                </p>
              </div>
            </Link>

            {/* Botones admin - solo desktop */}
            {(user as any)?.role === 'admin' && (
              <div className="hidden md:flex items-center gap-3 mr-4">
                <Link
                  href="/admin/dishes/add"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-yellow-600 text-white font-semibold transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">Agregar Plato</span>
                  <span className="lg:hidden">+ Plato</span>
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-[#DC2626] font-semibold transition-all hover:scale-105 shadow-md border-2 border-[#DC2626]"
                >
                  <Tag className="w-4 h-4" />
                  <span className="hidden lg:inline">Categorías</span>
                  <span className="lg:hidden">Cats.</span>
                </Link>
              </div>
            )}

            {/* Acciones: Carrito + Usuario */}
            <div className="flex items-center gap-4">

              {/* 🛒 Carrito real */}
              <CartButton />

              {/* Usuario */}
              <div className="relative user-button">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2 p-2 pl-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors group"
                >
                  {user ? (
                    <>
                      {user.photoURL ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'Usuario'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<div class="w-full h-full bg-white flex items-center justify-center font-bold text-[#EC1F25] text-sm">${getUserInitials()}</div>`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#EC1F25] text-sm">
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="font-medium text-white group-hover:text-[#FFF100] transition-colors hidden md:block">
                        {formatUserName(user.displayName)}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <User className="w-4 h-4 text-[#EC1F25]" />
                      </div>
                      <span className="font-medium text-white group-hover:text-[#FFF100] transition-colors hidden md:block">
                        INGRESAR
                      </span>
                    </>
                  )}
                </button>

                {/* Menú desplegable */}
                {isUserMenuOpen && user && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 user-menu animate-fadeIn z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EC1F25]">
                            <img
                              src={user.photoURL}
                              alt={user.displayName || 'Usuario'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `<div class="w-full h-full bg-[#EC1F25] flex items-center justify-center font-bold text-white text-sm">${getUserInitials()}</div>`;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#EC1F25] flex items-center justify-center font-bold text-white text-sm">
                            {getUserInitials()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{user.displayName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                            (user as any).role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {(user as any).role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="p-2">
                      <Link href="/profile" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors">
                        <User className="w-4 h-4" /> Mi Perfil
                      </Link>
                      <Link href="/profile/edit" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Perfil
                      </Link>
                      <Link href="/orders" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Mis Pedidos
                      </Link>

                      {/* Panel admin */}
                      {(user as any)?.role === 'admin' && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="px-3 py-1 mb-2">
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                              🚀 Panel Administrativo
                            </span>
                          </div>
                          <Link href="/admin/dashboard" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-purple-50 text-purple-700 transition-colors mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            Dashboard Admin
                          </Link>
                          <Link href="/admin/dishes/add" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-yellow-50 text-yellow-700 transition-colors mb-1">
                            <Plus className="w-4 h-4" /> Agregar Plato
                          </Link>
                          <Link href="/admin/categories" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-red-50 text-red-700 transition-colors">
                            <Tag className="w-4 h-4" /> Gestionar Categorías
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}