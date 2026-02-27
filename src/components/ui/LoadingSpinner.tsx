'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'yellow' | 'gray' | 'white';
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'red',
  fullScreen = false, 
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    red: 'text-red-600',
    yellow: 'text-yellow-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]}`}>
        <Loader2 className="w-full h-full animate-spin" />
      </div>
      {message && (
        <p className="mt-3 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}