// src/components/menu/SpecialOptionModal.tsx
'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

export interface SpecialOption {
  type: string;
  label: string;
  price: number;
  description?: string;
}

interface SpecialOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  dishPrice: number;
  options: SpecialOption[];
  onSelect: (selectedOption: SpecialOption) => void;
}

export default function SpecialOptionModal({
  isOpen,
  onClose,
  dishName,
  dishPrice,
  options,
  onSelect
}: SpecialOptionModalProps) {
  const [selectedOption, setSelectedOption] = useState<SpecialOption | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#EC1F25] to-red-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-1">Elige tu opción</h3>
              <p className="text-white/90 text-lg">{dishName}</p>
              <p className="text-white/80 text-sm mt-2">Precio base: S/ {dishPrice.toFixed(2)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Opciones */}
        <div className="p-6 space-y-3">
          {options.map((option) => {
            const totalPrice = dishPrice + option.price;
            const isSelected = selectedOption?.type === option.type;
            
            return (
              <button
                key={option.type}
                onClick={() => setSelectedOption(option)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#EC1F25] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      Precio base: S/ {dishPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#EC1F25] text-lg">
                      +S/ {option.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: S/ {totalPrice.toFixed(2)}
                    </div>
                    {isSelected && (
                      <div className="text-green-600 text-sm mt-1">
                        <Check className="w-4 h-4 inline" /> Seleccionado
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              if (selectedOption) {
                onSelect(selectedOption);
              }
            }}
            disabled={!selectedOption}
            className="w-full py-3 bg-[#EC1F25] text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar y agregar
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            * El precio incluye la opción seleccionada
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}