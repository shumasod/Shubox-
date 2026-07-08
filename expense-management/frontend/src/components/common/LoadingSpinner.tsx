import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({ size = 'md', className = '', label }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-blue-600 border-gray-200 ${sizeClasses[size]}`}
        role="status"
        aria-label={label ?? '読み込み中'}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <LoadingSpinner size="lg" label="読み込み中..."/>
    </div>
  );
}
