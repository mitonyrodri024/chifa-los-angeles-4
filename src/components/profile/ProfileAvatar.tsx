'use client';

import { useState } from 'react';
import { User } from '@/types/user.types';

interface ProfileAvatarProps {
  user: User;
  onAvatarChange?: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfileAvatar({ 
  user, 
  onAvatarChange, 
  size = 'md' 
}: ProfileAvatarProps) {
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-xl',
    lg: 'w-32 h-32 text-2xl'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const getInitials = () => {
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = user.photoURL || '';

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      {onAvatarChange && (
        <>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="avatar-upload"
            onChange={handleFileChange}
          />
          
          <button
            type="button"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white transition-opacity duration-200 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}