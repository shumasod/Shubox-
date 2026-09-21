import React, { useCallback, useRef, useState } from 'react';

interface UploadFile {
  id:       string;
  file:     File;
  preview?: string;
  progress: number;
  status:   'pending' | 'uploading' | 'done' | 'error';
  url?:     string;
  error?:   string;
}

interface Props {
  accept?:      string[];
  maxSizeMb?:   number;
  multiple?:    boolean;
  onUpload:     (files: UploadFile[]) => void;
  uploadFn:     (file: File, onProgress: (pct: number) => void) => Promise<string>;
}

const MAX_SIZE_DEFAULT = 10;

const genId = () => Math.random().toString(36).slice(2);

export const FileUploadDropzone: React.FC<Props> = ({
  accept     = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeMb  = MAX_SIZE_DEFAULT,
  multiple   = false,
  onUpload,
  uploadFn,
}) => {
  const [files, setFiles]   = useState<UploadFile[]>([]);
  const [isDragging, setDragging] = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);

  const updateFile = (id: string, patch: Partial<UploadFile>) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const processFiles = useCallback(async (rawFiles: FileList | File[]) => {
    const list = Array.from(rawFiles).slice(0, multiple ? undefined : 1);

    const newEntries: UploadFile[] = list
      .filter(file => {
        if (!accept.includes(file.type)) return false;
        if (file.size > maxSizeMb * 1024 * 1024) return false;
        return true;
      })
      .map(file => ({
        id:      genId(),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status:   'pending' as const,
      }));

    setFiles(prev => [...prev, ...newEntries]);

    const uploaded: UploadFile[] = [];
    for (const entry of newEntries) {
      updateFile(entry.id, { status: 'uploading' });
      try {
        const url = await uploadFn(entry.file, pct => updateFile(entry.id, { progress: pct }));
        updateFile(entry.id, { status: 'done', progress: 100, url });
        uploaded.push({ ...entry, status: 'done', url });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        updateFile(entry.id, { status: 'error', error: msg });
      }
    }

    if (uploaded.length > 0) onUpload(uploaded);
  }, [accept, maxSizeMb, multiple, uploadFn, onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to browse"
        onDragEnter={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setDragging(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <svg className="mx-auto w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {accept.map(t => t.split('/')[1]?.toUpperCase()).join(', ')} up to {maxSizeMb}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={e => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map(f => (
            <li key={f.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
              {f.preview
                ? <img src={f.preview} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                : <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{f.file.name}</p>
                {f.status === 'uploading' && (
                  <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${f.progress}%` }} />
                  </div>
                )}
                {f.status === 'error' && <p className="text-xs text-red-500 mt-0.5">{f.error}</p>}
                {f.status === 'done' && <p className="text-xs text-green-600 mt-0.5">Uploaded</p>}
              </div>
              <button
                onClick={() => removeFile(f.id)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500"
                aria-label="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
