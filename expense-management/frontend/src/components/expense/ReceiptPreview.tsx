import React, { useState, useCallback, useEffect } from 'react';

interface Receipt {
  id: number;
  filename: string;
  url: string;
  mime_type: string;
  file_size: number;
}

interface Props {
  receipts: Receipt[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mime: string) {
  return mime.startsWith('image/');
}

function Lightbox({ receipt, onClose, onPrev, onNext, hasPrev, hasNext }: {
  receipt: Receipt;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [receipt.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium truncate max-w-xs">{receipt.filename}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="text-gray-300 hover:text-white px-2 py-1 text-lg" title="縮小">−</button>
          <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="text-gray-300 hover:text-white px-2 py-1 text-lg" title="拡大">+</button>
          <a
            href={receipt.url}
            download={receipt.filename}
            className="text-gray-300 hover:text-white"
            title="ダウンロード"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          <button onClick={onClose} className="text-gray-300 hover:text-white ml-2" title="閉じる">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {hasPrev && (
          <button onClick={onPrev} className="absolute left-2 text-white/60 hover:text-white text-3xl px-3 py-8">‹</button>
        )}
        {isImage(receipt.mime_type) ? (
          <img
            src={receipt.url}
            alt={receipt.filename}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.15s' }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="text-white text-center space-y-3">
            <p className="text-4xl">📄</p>
            <p>{receipt.filename}</p>
            <a href={receipt.url} download className="underline text-indigo-300">ダウンロード</a>
          </div>
        )}
        {hasNext && (
          <button onClick={onNext} className="absolute right-2 text-white/60 hover:text-white text-3xl px-3 py-8">›</button>
        )}
      </div>
    </div>
  );
}

export default function ReceiptPreview({ receipts }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open  = useCallback((i: number) => setActiveIndex(i), []);
  const close  = useCallback(() => setActiveIndex(null), []);
  const prev   = useCallback(() => setActiveIndex(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const next   = useCallback(() => setActiveIndex(i => (i !== null && i < receipts.length - 1 ? i + 1 : i)), [receipts.length]);

  if (receipts.length === 0) {
    return <p className="text-sm text-gray-400">領収書なし</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {receipts.map((r, i) => (
          <button
            key={r.id}
            onClick={() => open(i)}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:ring-2 hover:ring-indigo-500 transition-all group"
          >
            {isImage(r.mime_type) ? (
              <img src={r.url} alt={r.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <span className="text-2xl">📄</span>
                <span className="text-xs text-gray-500 px-1 truncate w-full text-center">{r.filename}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          receipt={receipts[activeIndex]}
          onClose={close}
          onPrev={prev}
          onNext={next}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < receipts.length - 1}
        />
      )}
    </>
  );
}
