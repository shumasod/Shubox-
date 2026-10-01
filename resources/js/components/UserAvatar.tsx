import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function AvatarImage({
  src,
  name,
  sizeClass,
}: {
  src: string | null | undefined;
  name: string;
  sizeClass: string;
}) {
  const [imgError, setImgError] = useState(false);
  const color = getColor(name);
  const initials = getInitials(name);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} ${color} flex items-center justify-center rounded-full font-semibold text-white`}
      aria-label={name}
    >
      {initials}
    </span>
  );
}

export default function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  editable = false,
}: UserAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const sizeClass = SIZE_CLASSES[size];

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      const r = await fetch('/api/user/avatar', { method: 'POST', body: form });
      if (!r.ok) throw new Error((await r.json()).message ?? 'Upload failed');
      return r.json() as Promise<{ avatar_url: string }>;
    },
    onMutate: () => setUploading(true),
    onSettled: () => setUploading(false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => {
      setPreview(null);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar must be under 2 MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    upload.mutate(file);
  };

  if (!editable) {
    return <AvatarImage src={avatarUrl} name={name} sizeClass={sizeClass} />;
  }

  return (
    <div className="relative inline-block">
      <AvatarImage src={preview ?? avatarUrl} name={name} sizeClass={sizeClass} />

      {uploading && (
        <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40`}>
          <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {!uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100"
          aria-label="Change avatar"
        >
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
