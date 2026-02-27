'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, MapPin, Home } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  icon?: 'email' | 'password' | 'user' | 'phone' | 'address' | 'city';
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  multiline = false,
  rows = 4,
  icon,
  type = 'text',
  showPasswordToggle = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && type === 'password' && showPassword ? 'text' : type;

  const getIcon = () => {
    switch (icon) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'password': return <Lock className="w-5 h-5" />;
      case 'user': return <UserIcon className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'address': return <Home className="w-5 h-5" />;
      case 'city': return <MapPin className="w-5 h-5" />;
      default: return null;
    }
  };

  const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:border-transparent
    ${error 
      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-red-500 focus:border-red-500 hover:border-red-300'
    }
    ${icon ? 'pl-11' : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {getIcon()}
          </div>
        )}

        {multiline ? (
          <textarea
            className={`${inputClasses} resize-none min-h-[100px]`}
            rows={rows}
            {...props as any}
          />
        ) : (
          <input
            className={inputClasses}
            type={inputType}
            {...props}
          />
        )}

        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;