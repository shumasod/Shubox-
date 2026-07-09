import React, { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  showTooltip?: boolean;
  online?: boolean;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const INDICATOR_SIZE: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function nameToColor(name: string): string {
  const PALETTE = [
    'bg-red-500',    'bg-orange-500', 'bg-amber-500',
    'bg-emerald-500','bg-teal-500',   'bg-cyan-500',
    'bg-blue-500',   'bg-violet-500', 'bg-pink-500',
    'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function UserAvatar({
  name,
  src,
  size = 'md',
  className = '',
  showTooltip = false,
  online,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const bgColor  = nameToColor(name);
  const sizeClass = SIZE_CLASSES[size];

  const showImage = src && !imgError;

  return (
    <div
      className={`relative inline-flex flex-shrink-0 ${className}`}
      title={showTooltip ? name : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`}
        />
      ) : (
        <span
          className={`${sizeClass} ${bgColor} rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center font-semibold text-white select-none`}
          aria-label={name}
        >
          {initials}
        </span>
      )}

      {online !== undefined && (
        <span
          className={[
            INDICATOR_SIZE[size],
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-gray-800',
            online ? 'bg-green-400' : 'bg-gray-400',
          ].join(' ')}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
