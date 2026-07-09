import { useEffect, useRef, useCallback, useState } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveOptions {
  expenseId?: number;
  debounceMs?: number;
  onSaveSuccess?: (data: Record<string, unknown>) => void;
  onSaveError?: (err: Error) => void;
}

interface AutosaveResult {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  triggerSave: (data: Record<string, unknown>) => void;
}

async function saveDraft(expenseId: number | undefined, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const url    = expenseId ? `/api/v1/expenses/${expenseId}` : '/api/v1/expenses';
  const method = expenseId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...data, status: 'draft' }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Save failed with status ${res.status}`);
  }

  return res.json();
}

export function useExpenseAutosave({
  expenseId,
  debounceMs = 1500,
  onSaveSuccess,
  onSaveError,
}: AutosaveOptions = {}): AutosaveResult {
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingData = useRef<Record<string, unknown> | null>(null);
  const isSaving    = useRef(false);

  const doSave = useCallback(async (data: Record<string, unknown>) => {
    if (isSaving.current) {
      pendingData.current = data;
      return;
    }

    isSaving.current = true;
    setSaveStatus('saving');

    try {
      const result = await saveDraft(expenseId, data);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      onSaveSuccess?.(result);
    } catch (err) {
      setSaveStatus('error');
      onSaveError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      isSaving.current = false;

      if (pendingData.current) {
        const next = pendingData.current;
        pendingData.current = null;
        doSave(next);
      }
    }
  }, [expenseId, onSaveSuccess, onSaveError]);

  const triggerSave = useCallback((data: Record<string, unknown>) => {
    setSaveStatus('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(data), debounceMs);
  }, [doSave, debounceMs]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { saveStatus, lastSavedAt, triggerSave };
}
