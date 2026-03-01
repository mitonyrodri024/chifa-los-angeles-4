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
  categories?: Category[];
  selectedCategories?: string[]; // Array de IDs seleccionados
  onCategoryChange?: (categoryIds: string[]) => void; // Función que recibe array
}

export default function MenuHeader({
  title = "Nuestro Menú",
  subtitle = "Descubre la auténtica sazón china",
  user,
  onSearch,
  showSearch = true,
  dishCount = 0,
  categories = [],
  selectedCategories = [],
  onCategoryChange
}: MenuHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeCategories = categories ? categories.filter(cat => cat.isActive) : [];
  
  // Obtener datos de las categorías seleccionadas
  const selectedCategoriesData = selectedCategories.length > 0 && activeCategories.length > 0
    ? activeCategories.filter(cat => selectedCategories.includes(cat.id))
    : [];

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

  // Función para manejar selección múltiple
  const handleCategoryToggle = (categoryId: string) => {
    if (!onCategoryChange) return;

    let newSelectedCategories: string[];
    
    if (selectedCategories.includes(categoryId)) {
      // Si ya está seleccionada, la quitamos
      newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      // Si no está seleccionada, la agregamos
      newSelectedCategories = [...selectedCategories, categoryId];
    }
    
    onCategoryChange(newSelectedCategories);
  };

  // Limpiar todas las categorías
  const clearAllCategories = () => {
    if (onCategoryChange) {
      onCategoryChange([]);
    }
    setIsFilterOpen(false);
  };

  // Calcular total de platos en categorías seleccionadas
  const totalDishesInSelected = selectedCategoriesData.reduce((acc, cat) => acc + cat.dishCount, 0);

  return (
    <div className="mb-6 md:mb-10">
      {/* Header principal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EC1F25] flex items-center justify-center shadow-lg shadow-[#EC1F25]/30">
              <span className="text-xl md:text-2xl">🍜</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
          
          <p className="text-gray-600 text-base md:text-xl">
            {subtitle}
            {dishCount > 0 && (
              <span className="ml-2 text-[#EC1F25] font-semibold">
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
              className="flex items-center gap-2 px-4 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Plato</span>
            </a>
            
            <a
              href="/admin/categories"
              className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-[#EC1F25] font-semibold rounded-xl transition-all hover:scale-105 shadow-md border-2 border-[#EC1F25]"
            >
              <Tag className="w-5 h-5" />
              <span>Categorías</span>
            </a>
          </div>
        )}
      </div>

      {/* Barra de búsqueda y filtros */}
      {showSearch && onSearch && (
        <div className="flex items-center gap-2 md:gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar platos..."
              className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC1F25] focus:border-transparent transition-all shadow-sm hover:shadow-md text-sm md:text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>

          {/* Botón de filtros */}
          {categories && categories.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 md:px-5 py-3 md:py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap ${
                  selectedCategories.length > 0
                    ? 'bg-[#EC1F25] text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#EC1F25]'
                }`}
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {selectedCategories.length > 0 
                    ? `${selectedCategories.length} categoría${selectedCategories.length > 1 ? 's' : ''}`
                    : 'Filtros'}
                </span>
                {selectedCategories.length > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {selectedCategories.length}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de filtros */}
              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  
                  <div className="absolute right-0 top-full mt-2 w-72 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#EC1F25] text-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/90 text-sm">{activeCategories.length} categorías disponibles</p>
                          <p className="text-xs text-white/70 mt-1">
                            {selectedCategories.length > 0 
                              ? `${selectedCategories.length} seleccionada${selectedCategories.length > 1 ? 's' : ''}`
                              : 'Selecciona una o varias categorías'}
                          </p>
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
                      {activeCategories.map((category) => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                          <div
                            key={category.id}
                            className="p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                            onClick={() => handleCategoryToggle(category.id)}
                          >
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected 
                                  ? 'bg-[#EC1F25] border-[#EC1F25]' 
                                  : 'border-gray-300 hover:border-[#EC1F25]'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              
                              {/* Icono */}
                              <div className={`p-2 rounded-lg ${
                                isSelected ? 'bg-[#EC1F25]/10' : 'bg-gray-100'
                              }`}>
                                <span className="text-xl">{category.icon || '🍽️'}</span>
                              </div>
                              
                              {/* Info */}
                              <div className="flex-1">
                                <div className={`font-bold ${
                                  isSelected ? 'text-[#EC1F25]' : 'text-gray-900'
                                }`}>
                                  {category.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {category.dishCount} {category.dishCount === 1 ? 'plato' : 'platos'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button
                          onClick={clearAllCategories}
                          className="flex-1 py-2 text-gray-600 hover:text-gray-800 font-semibold text-sm bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          Limpiar todo
                        </button>
                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="flex-1 py-2 bg-[#EC1F25] hover:bg-[#d41a1f] text-white font-semibold text-sm rounded-lg transition-colors"
                        >
                          Aplicar ({selectedCategories.length})
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botones admin móvil */}
      {user?.role === 'admin' && (
        <div className="md:hidden flex gap-2 mt-4">
          <a
            href="/admin/dishes/add"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </a>
          
          <a
            href="/admin/categories"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#EC1F25] font-semibold rounded-xl transition-all active:scale-95 shadow-md border-2 border-[#EC1F25]"
          >
            <Tag className="w-5 h-5" />
            <span>Categorías</span>
          </a>
        </div>
      )}

      {/* Chips de categorías seleccionadas */}
      {selectedCategoriesData.length > 0 && (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#EC1F25]" />
              <span className="text-sm font-semibold text-gray-700">
                Filtros activos ({selectedCategoriesData.length})
              </span>
            </div>
            <button
              onClick={clearAllCategories}
              className="text-sm text-[#EC1F25] hover:text-[#d41a1f] font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar todo
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedCategoriesData.map((category) => (
              <div
                key={category.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EC1F25] text-white rounded-full text-sm font-medium shadow-sm"
              >
                <span>{category.icon || '🍽️'}</span>
                <span>{category.name}</span>
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              <span>{totalDishesInSelected} {totalDishesInSelected === 1 ? 'plato' : 'platos'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de búsqueda */}
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