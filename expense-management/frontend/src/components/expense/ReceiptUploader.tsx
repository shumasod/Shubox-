import React, { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptApi } from '../../lib/api';
import { expenseKeys } from '../../hooks/useExpenses';

interface Props {
  expenseId: string;
  disabled?: boolean;
}

const ACCEPT = '.jpg,.jpeg,.png,.pdf,.heic';
const MAX_SIZE_MB = 10;

export function ReceiptUploader({ expenseId, disabled }: Props) {
  const [dragOver, setDragOver]   = useState(false);
  const [previews, setPreviews]   = useState<string[]>([]);
  const queryClient               = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => receiptApi.upload(expenseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(expenseId) });
    },
  });

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return;

      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          alert(`${file.name} は ${MAX_SIZE_MB}MB を超えています`);
          continue;
        }

        // プレビュー表示（画像のみ）
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) =>
            setPreviews((p) => [...p, e.target?.result as string]);
          reader.readAsDataURL(file);
        }

        await uploadMutation.mutateAsync(file);
      }
    },
    [expenseId, disabled, uploadMutation]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      {/* ドロップゾーン */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        <input
          type="file"
          accept={ACCEPT}
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploadMutation.isPending ? (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            アップロード中...
          </div>
        ) : (
          <>
            <UploadIcon className={disabled ? 'text-gray-300' : 'text-gray-400'} />
            <p className={`mt-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              クリックまたはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG, PDF, HEIC (最大 {MAX_SIZE_MB}MB)
            </p>
          </>
        )}
      </label>

      {/* エラー表示 */}
      {uploadMutation.isError && (
        <p className="text-sm text-red-600">アップロードに失敗しました。もう一度試してください。</p>
      )}

      {/* プレビュー */}
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`レシート ${i + 1}`}
              className="w-20 h-20 object-cover rounded border border-gray-200"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-8 h-8 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
