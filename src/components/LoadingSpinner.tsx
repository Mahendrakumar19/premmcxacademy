import React from 'react';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-zinc-700 border-t-yellow-400`}
        ></div>
        <div
          className={`${sizeClasses[size]} absolute top-0 animate-ping rounded-full border-yellow-400/20 opacity-75`}
        ></div>
      </div>
    </div>
  );
}
