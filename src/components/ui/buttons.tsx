'use client';

import { ButtonHTMLAttributes } from 'react';
import { ShoppingCart, User, Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'google';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50';
  
  const variantStyles = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500',
    secondary: 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-md hover:shadow-lg focus:ring-yellow-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg focus:ring-red-500',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100 text-black focus:ring-gray-500',
    google: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm hover:shadow focus:ring-blue-500'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-7 py-3.5 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export const CartButton = ({ itemCount = 0 }: { itemCount?: number }) => {
  return (
    <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
      <ShoppingCart className="w-6 h-6 text-black group-hover:text-red-600 transition-colors duration-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export const UserButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button 
      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
        <User className="w-5 h-5 text-black" />
      </div>
      <span className="font-medium text-black group-hover:text-red-600 transition-colors duration-300 hidden md:block">
        Iniciar Sesión
      </span>
    </button>
  );
};

export default Button;