import React, { useCallback, useId, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadedReceipt {
  key: string;
  url: string;
  name: string;
  size: number;
  mime_type: string;
}

interface ReceiptUploadProps {
  expenseId?: number;
  onUploaded?: (receipt: UploadedReceipt) => void;
  maxFiles?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${file.name}: 対応形式はJPEG・PNG・WebP・PDFです`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: ファイルサイズは10MB以下にしてください`;
  }
  return null;
}

export function ReceiptUpload({ expenseId, onUploaded, maxFiles = 5 }: ReceiptUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<UploadedReceipt[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. Request presigned URL from backend
      const { data } = await api.post('/receipts/presign', {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        expense_id: expenseId,
      });

      // 2. Upload directly to S3 with presigned URL
      await fetch(data.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'x-amz-server-side-encryption': 'aws:kms',
        },
      });

      return data as UploadedReceipt;
    },
    onSuccess: (receipt) => {
      setUploaded((prev) => [...prev, receipt]);
      onUploaded?.(receipt);
    },
  });

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const newErrors: string[] = [];
      const remaining = maxFiles - uploaded.length;

      if (fileArr.length > remaining) {
        newErrors.push(`添付できるのは最大${maxFiles}件です`);
      }

      const valid = fileArr.slice(0, remaining).filter((f) => {
        const err = validateFile(f);
        if (err) { newErrors.push(err); return false; }
        return true;
      });

      setErrors(newErrors);
      valid.forEach((f) => uploadMutation.mutate(f));
    },
    [maxFiles, uploaded.length, uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles]
  );

  const removeUploaded = useCallback((key: string) => {
    setUploaded((prev) => prev.filter((r) => r.key !== key));
  }, []);

  const canUploadMore = uploaded.length < maxFiles;

  return {
    node: (
      <div className="space-y-3">
        {/* Drop zone */}
        {canUploadMore && (
          <div
            role="button"
            tabIndex={0}
            aria-label="領収書をドロップまたはクリックしてアップロード"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            <svg className="mb-2 h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ファイルをドラッグ&ドロップ、または
              <label htmlFor={inputId} className="ml-1 cursor-pointer text-blue-600 hover:underline dark:text-blue-400">
                クリックして選択
              </label>
            </p>
            <p className="mt-1 text-xs text-gray-400">JPEG・PNG・WebP・PDF、最大10MB</p>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              className="sr-only"
              accept={ALLOWED_MIME_TYPES.join(',')}
              multiple={maxFiles > 1}
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Error messages */}
        {errors.length > 0 && (
          <ul role="alert" className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-500">{err}</li>
            ))}
          </ul>
        )}

        {/* Upload progress */}
        {uploadMutation.isPending && (
          <p className="text-xs text-gray-500 animate-pulse">アップロード中...</p>
        )}

        {/* Uploaded files */}
        {uploaded.length > 0 && (
          <ul className="space-y-2">
            {uploaded.map((r) => (
              <li key={r.key} className="flex items-center gap-3 rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2">
                <span className="text-lg" aria-hidden="true">
                  {r.mime_type === 'application/pdf' ? '📄' : '🖼️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{r.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(r.size)}</p>
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  表示
                </a>
                <button
                  type="button"
                  onClick={() => removeUploaded(r.key)}
                  aria-label={`${r.name}を削除`}
                  className="rounded p-1 text-gray-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    uploaded,
  };
}
