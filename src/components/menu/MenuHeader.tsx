'use client';

import { Plus, Tag, Search, X, Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  role: 'admin' | 'user';
  name: string;
  email: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  dishCount: number;
  isActive: boolean;
}

interface MenuHeaderProps {
  title?: string;
  subtitle?: string;
  user?: User | null;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  dishCount?: number;
  // Props para filtros
  categories?: Category[];
  selectedCategory?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
}

export default function MenuHeader({
  title = "Nuestro Menú",
  subtitle = "Descubre la auténtica sazón china",
  user,
  onSearch,
  showSearch = true,
  dishCount = 0,
  categories = [],
  selectedCategory = null,
  onCategoryChange
}: MenuHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeCategories = categories ? categories.filter(cat => cat.isActive) : [];
  const selectedCategoryData = selectedCategory && activeCategories.length > 0
    ? activeCategories.find(cat => cat.id === selectedCategory)
    : null;

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
    setIsFilterOpen(false);
  };

  return (
    <div className="mb-6 md:mb-10">
      {/* Header principal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <span className="text-xl md:text-2xl">🍜</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
          
          <p className="text-gray-600 text-base md:text-xl">
            {subtitle}
            {dishCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                • {dishCount} {dishCount === 1 ? 'plato' : 'platos'}
              </span>
            )}
          </p>
        </div>

        {/* Botones administrativos - SOLO para admin (desktop) */}
        {user?.role === 'admin' && (
          <div className="hidden md:flex gap-3">
            <a
              href="/admin/dishes/add"
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-semibold rounded-xl transition-all hover:scale-105 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Plato</span>
            </a>
            
            <a
              href="/admin/categories"
              className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-red-600 font-semibold rounded-xl transition-all hover:scale-105 shadow-md border-2 border-red-600"
            >
              <Tag className="w-5 h-5" />
              <span>Categorías</span>
            </a>
          </div>
        )}
      </div>

      {/* Barra de búsqueda y filtros - UNA SOLA LÍNEA */}
      {showSearch && onSearch && (
        <div className="flex items-center gap-2 md:gap-3">
          {/* Buscador - ocupa el espacio restante */}
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar platos..."
              className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm hover:shadow-md text-sm md:text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>

          {/* Botón de filtros desplegable */}
          {categories && categories.length > 0 && (
            <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 md:px-5 py-3 md:py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap ${
                selectedCategory
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300'
              }`}
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">
                {selectedCategoryData ? selectedCategoryData.name : 'Filtros'}
              </span>
              {selectedCategory && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                  1
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú desplegable de filtros */}
            {isFilterOpen && (
              <>
                {/* Overlay para cerrar al hacer click afuera */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
                  {/* Header del dropdown */}
                  <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">{activeCategories.length} disponibles</p>
                      </div>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de categorías */}
                  <div className="max-h-96 overflow-y-auto p-2">
                    {/* Opción "Todos" */}
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={`w-full text-left p-3 rounded-xl transition-all mb-1 ${
                        selectedCategory === null
                          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCategory === null 
                              ? 'bg-white/20' 
                              : 'bg-red-100'
                          }`}>
                            <span className="text-xl">🍽️</span>
                          </div>
                          <div>
                            <div className={`font-bold ${
                              selectedCategory === null ? 'text-white' : 'text-gray-900'
                            }`}>
                              Todos los platos
                            </div>
                            <div className={`text-sm ${
                              selectedCategory === null ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              Ver menú completo
                            </div>
                          </div>
                        </div>
                        {selectedCategory === null && (
                          <div className="p-1.5 bg-white/20 rounded-full">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Categorías */}
                    {activeCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all mb-1 ${
                          selectedCategory === category.id
                            ? 'text-white shadow-lg'
                            : 'hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor:
                            selectedCategory === category.id
                              ? category.color || '#DC2626'
                              : '',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                selectedCategory === category.id
                                  ? 'bg-white/20'
                                  : 'bg-white shadow-sm'
                              }`}
                            >
                              <span className="text-xl">{category.icon || '🍽️'}</span>
                            </div>
                            <div>
                              <div className={`font-bold ${
                                selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                              }`}>
                                {category.name}
                              </div>
                              <div className={`text-sm ${
                                selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {category.dishCount} {category.dishCount === 1 ? 'plato' : 'platos'}
                              </div>
                            </div>
                          </div>
                          {selectedCategory === category.id && (
                            <div className="p-1.5 bg-white/20 rounded-full">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  {selectedCategory && (
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className="w-full py-2 text-red-600 hover:text-red-700 font-semibold text-sm"
                      >
                        Limpiar filtro
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          )}
        </div>
      )}

      {/* Botones administrativos - SOLO para admin (móvil) */}
      {user?.role === 'admin' && (
        <div className="md:hidden flex gap-2 mt-4">
          <a
            href="/admin/dishes/add"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-xl transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </a>
          
          <a
            href="/admin/categories"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 font-semibold rounded-xl transition-all active:scale-95 shadow-md border-2 border-red-600"
          >
            <Tag className="w-5 h-5" />
            <span>Categorías</span>
          </a>
        </div>
      )}

      {/* Indicador de filtro activo */}
      {selectedCategoryData && (
        <div className="mt-3 bg-gradient-to-r from-white via-gray-50 to-white rounded-xl p-3 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-lg shadow-md shadow-red-500/30">
                <span className="text-lg">{selectedCategoryData.icon}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Filtrando por
                </div>
                <div className="font-bold text-gray-900">
                  {selectedCategoryData.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-red-600 text-lg">
                  {selectedCategoryData.dishCount}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {selectedCategoryData.dishCount === 1 ? 'plato' : 'platos'}
                </div>
              </div>
              <button
                onClick={() => {
                  if (onCategoryChange) {
                    onCategoryChange(null);
                  }
                }}
                className="group p-2 bg-gray-100 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de búsqueda activa */}
      {searchQuery && (
        <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Buscando: <span className="font-bold">"{searchQuery}"</span>
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}