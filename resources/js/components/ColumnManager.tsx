import React, { useRef, useState } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
  pinned?: boolean;
}

interface ColumnManagerProps {
  columns: ColumnDef[];
  onChange: (columns: ColumnDef[]) => void;
}

function DragHandle() {
  return (
    <svg className="h-4 w-4 cursor-grab text-gray-400 active:cursor-grabbing" fill="currentColor" viewBox="0 0 16 16">
      <circle cx="6" cy="4" r="1.2" /><circle cx="10" cy="4" r="1.2" />
      <circle cx="6" cy="8" r="1.2" /><circle cx="10" cy="8" r="1.2" />
      <circle cx="6" cy="12" r="1.2" /><circle cx="10" cy="12" r="1.2" />
    </svg>
  );
}

export default function ColumnManager({ columns, onChange }: ColumnManagerProps) {
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const visibleCount = columns.filter((c) => c.visible).length;

  const toggleVisible = (key: string) => {
    onChange(columns.map((c) => (c.key === key && !c.pinned ? { ...c, visible: !c.visible } : c)));
  };

  const showAll  = () => onChange(columns.map((c) => ({ ...c, visible: true })));
  const hideAll  = () => onChange(columns.map((c) => (c.pinned ? c : { ...c, visible: false })));
  const resetAll = () => onChange(columns.map((c) => ({ ...c, visible: true })));

  // Drag-to-reorder
  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setOverIndex(i); };
  const handleDrop      = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null); setOverIndex(null); return;
    }
    const next = [...columns];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(overIndex, 0, moved);
    onChange(next);
    setDragIndex(null); setOverIndex(null);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Columns
        <span className="rounded-full bg-blue-100 px-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {visibleCount}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Manage columns"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Manage columns</span>
            <div className="flex gap-2 text-xs">
              <button onClick={showAll}  className="text-blue-600 hover:underline dark:text-blue-400">Show all</button>
              <button onClick={hideAll}  className="text-gray-500 hover:underline dark:text-gray-400">Hide all</button>
              <button onClick={resetAll} className="text-gray-500 hover:underline dark:text-gray-400">Reset</button>
            </div>
          </div>

          {/* Column list */}
          <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
            {columns.map((col, i) => (
              <li
                key={col.key}
                draggable={!col.pinned}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={handleDrop}
                onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  overIndex === i && dragIndex !== i
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className={col.pinned ? 'opacity-30' : ''}>
                  <DragHandle />
                </span>

                <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                  {col.label}
                  {col.pinned && (
                    <span className="ml-1 text-[10px] text-gray-400">(pinned)</span>
                  )}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={col.visible}
                  onClick={() => toggleVisible(col.key)}
                  disabled={col.pinned}
                  className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:opacity-40 ${
                    col.visible ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      col.visible ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-blue-600 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
