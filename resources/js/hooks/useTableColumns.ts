import { useState, useEffect } from 'react';
import type { ColumnDef } from '../components/TableColumnSelector';

export function useTableColumns(columns: ColumnDef[], storageKey: string) {
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const validKeys = new Set(columns.map(c => c.key));
        const filtered  = parsed.filter(k => validKeys.has(k));
        // Always include required columns
        const required  = columns.filter(c => c.required).map(c => c.key);
        return Array.from(new Set([...required, ...filtered]));
      }
    } catch {
      // ignore
    }
    return columns.map(c => c.key);
  });

  const visibleColumns = columns.filter(c => visibleKeys.includes(c.key));

  return { visibleKeys, setVisibleKeys, visibleColumns };
}
