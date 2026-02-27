'use client';

import { Category } from '@/types/menu.types';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  showAllOption = true
}: CategoryFilterProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeCategories = categories.filter(cat => cat.isActive);

  const handleCategoryClick = (categoryId: string | null) => {
    onCategoryChange(categoryId);
    setIsMobileMenuOpen(false);
  };

  const selectedCategoryData = selectedCategory
    ? activeCategories.find(cat => cat.id === selectedCategory)
    : null;

  return (
    <div className="space-y-4">
      {/* Filtro para desktop - Estilo horizontal minimalista */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden">
          {/* Gradiente decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 via-transparent to-red-50/50 pointer-events-none" />
          
          <div className="relative flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {showAllOption && (
              <button
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md border border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <span>Todos</span>
                  {selectedCategory === null && (
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                      {activeCategories.reduce((sum, cat) => sum + cat.dishCount, 0)}
                    </span>
                  )}
                </div>
                {selectedCategory === null && (
                  <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                )}
              </button>
            )}
            {activeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex-shrink-0 group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md border border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color || '#DC2626'
                      : '',
                  boxShadow:
                    selectedCategory === category.id
                      ? `0 10px 25px -5px ${category.color}40`
                      : '',
                }}
              >
                <div className="flex items-center gap-2">
                  {category.icon && <span className="text-lg">{category.icon}</span>}
                  <span>{category.name}</span>
                  {category.dishCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedCategory === category.id
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.dishCount}
                    </span>
                  )}
                </div>
                {selectedCategory === category.id && (
                  <div className="absolute inset-0 rounded-xl bg-white/10" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtro para móvil - Botón compacto y atractivo */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-red-300"
        >
          {/* Barra de color superior */}
          <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
          
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 bg-gradient-to-br from-red-600 to-red-500 rounded-xl shadow-md shadow-red-500/30">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                {selectedCategory && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  {selectedCategoryData ? (
                    <>
                      <span>{selectedCategoryData.icon}</span>
                      <span>{selectedCategoryData.name}</span>
                    </>
                  ) : (
                    'Filtrar categorías'
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {selectedCategory 
                    ? `${selectedCategoryData?.dishCount || 0} platos disponibles`
                    : `${activeCategories.length} categorías`
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <div className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-lg shadow-sm">
                  ✓ Activo
                </div>
              )}
              <div className="p-1 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Menú de filtros móvil - Diseño moderno tipo drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            {/* Overlay con blur */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Panel de filtros */}
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
              {/* Header con gradiente */}
              <div className="relative bg-gradient-to-r from-red-600 to-red-500 text-white p-6 pb-8">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Filtrar categorías</h3>
                    <p className="text-red-100 text-sm font-medium">
                      Selecciona una categoría para filtrar
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Indicador decorativo */}
                <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-t-3xl" />
              </div>

              {/* Lista de categorías con scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {showAllOption && (
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                      selectedCategory === null
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 scale-[1.02]'
                        : 'bg-gradient-to-br from-gray-50 to-white hover:shadow-md border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          selectedCategory === null 
                            ? 'bg-white/20 backdrop-blur-sm' 
                            : 'bg-red-100'
                        }`}>
                          <span className="text-2xl">🍽️</span>
                        </div>
                        <div>
                          <div className={`font-bold text-lg ${
                            selectedCategory === null ? 'text-white' : 'text-gray-900'
                          }`}>
                            Todos los platos
                          </div>
                          <div className={`text-sm font-medium ${
                            selectedCategory === null ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            Ver menú completo
                          </div>
                        </div>
                      </div>
                      {selectedCategory === null && (
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                )}
                {activeCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'text-white shadow-lg scale-[1.02]'
                        : 'bg-gradient-to-br from-gray-50 to-white hover:shadow-md border-2 border-gray-200'
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id
                          ? category.color || '#DC2626'
                          : '',
                      boxShadow:
                        selectedCategory === category.id
                          ? `0 10px 30px -5px ${category.color}40`
                          : '',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl ${
                            selectedCategory === category.id
                              ? 'bg-white/20 backdrop-blur-sm'
                              : 'bg-white shadow-sm'
                          }`}
                        >
                          <span className="text-2xl">{category.icon || '🍽️'}</span>
                        </div>
                        <div>
                          <div className={`font-bold text-lg ${
                            selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {category.name}
                          </div>
                          <div className={`text-sm font-medium ${
                            selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {category.dishCount} {category.dishCount === 1 ? 'plato' : 'platos'}
                          </div>
                        </div>
                      </div>
                      {selectedCategory === category.id && (
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer con estadísticas y botón */}
              <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-gray-700">
                      {selectedCategory ? '1 categoría' : 'Sin filtros'}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {activeCategories.length} disponibles
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 active:scale-95"
                >
                  Aplicar filtro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de filtro activo - Compacto y elegante */}
      {selectedCategoryData && (
        <div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-xl p-3 shadow-sm border-l-4 border-red-500">
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
                onClick={() => handleCategoryClick(null)}
                className="group p-2 bg-gray-100 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}