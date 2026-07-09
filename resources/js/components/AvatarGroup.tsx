import React from 'react';
import UserAvatar from './UserAvatar';

interface User {
  id: number;
  name: string;
  avatar_url?: string | null;
}

interface Props {
  users: User[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export default function AvatarGroup({ users, max = 4, size = 'sm', className = '' }: Props) {
  const visible  = users.slice(0, max);
  const overflow = users.length - max;

  const sizeClass = size === 'xs' ? 'w-6 h-6 text-[10px]' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((user, i) => (
        <div key={user.id} className={i > 0 ? '-ml-2' : ''} style={{ zIndex: visible.length - i }}>
          <UserAvatar
            name={user.name}
            src={user.avatar_url}
            size={size}
            showTooltip
          />
        </div>
      ))}
      {overflow > 0 && (
        <div className={`-ml-2 ${sizeClass} rounded-full bg-gray-200 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center`}>
          <span className="font-semibold text-gray-600 dark:text-gray-300">+{overflow}</span>
        </div>
      )}
    </div>
  );
}
