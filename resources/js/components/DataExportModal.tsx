import React, { useState } from 'react';
import { createPortal } from 'react-dom';

type ExportFormat = 'csv' | 'pdf' | 'excel';
type DatePreset = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FORMATS: { value: ExportFormat; label: string; ext: string; description: string }[] = [
  { value: 'csv',   label: 'CSV',   ext: '.csv', description: 'Spreadsheet-compatible, all fields' },
  { value: 'excel', label: 'Excel', ext: '.xlsx', description: 'Formatted workbook with charts' },
  { value: 'pdf',   label: 'PDF',   ext: '.pdf', description: 'Print-ready A4 report' },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'this_month',    label: 'This month' },
  { value: 'last_month',    label: 'Last month' },
  { value: 'this_quarter',  label: 'This quarter' },
  { value: 'this_year',     label: 'This year' },
  { value: 'custom',        label: 'Custom range' },
];

function presetToDates(preset: DatePreset): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (preset) {
    case 'this_month':
      return { start: fmt(new Date(y, m, 1)), end: fmt(new Date(y, m + 1, 0)) };
    case 'last_month':
      return { start: fmt(new Date(y, m - 1, 1)), end: fmt(new Date(y, m, 0)) };
    case 'this_quarter': {
      const q = Math.floor(m / 3);
      return { start: fmt(new Date(y, q * 3, 1)), end: fmt(new Date(y, q * 3 + 3, 0)) };
    }
    case 'this_year':
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    default:
      return { start: '', end: '' };
  }
}

export default function DataExportModal({ isOpen, onClose }: Props) {
  const [format, setFormat]   = useState<ExportFormat>('csv');
  const [preset, setPreset]   = useState<DatePreset>('this_month');
  const [startDate, setStart] = useState('');
  const [endDate, setEnd]     = useState('');
  const [isExporting, setExporting] = useState(false);
  const [statusFilter, setStatus]   = useState<string[]>(['approved', 'paid']);

  const resolvedDates = preset !== 'custom' ? presetToDates(preset) : { start: startDate, end: endDate };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        format,
        start_date: resolvedDates.start,
        end_date: resolvedDates.end,
        status: statusFilter.join(','),
      });

      if (format === 'pdf') {
        const res = await fetch(`/api/v1/expenses/export/pdf?${params}`, { method: 'POST' });
        const { job_id } = await res.json();
        alert(`PDF generation started. Job ID: ${job_id}. You will be notified when ready.`);
        onClose();
        return;
      }

      const res = await fetch(`/api/v1/expenses/export?${params}`);
      const blob = await res.blob();
      const ext = FORMATS.find(f => f.value === format)?.ext ?? '.csv';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${resolvedDates.start}-to-${resolvedDates.end}${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } finally {
      setExporting(false);
    }
  };

  const toggleStatus = (s: string) =>
    setStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 id="export-title" className="text-lg font-semibold text-gray-900 dark:text-white">Export Expenses</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Format */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map(f => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={[
                  'p-3 rounded-lg border-2 text-left transition-colors',
                  format === f.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300',
                ].join(' ')}
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white">{f.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
          <select
            value={preset}
            onChange={e => setPreset(e.target.value as DatePreset)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            {DATE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {preset === 'custom' && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input type="date" value={startDate} onChange={e => setStart(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm" />
              <input type="date" value={endDate} onChange={e => setEnd(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm" />
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Include Status</label>
          <div className="flex flex-wrap gap-2">
            {['draft', 'pending', 'approved', 'rejected', 'paid'].map(s => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                aria-pressed={statusFilter.includes(s)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  statusFilter.includes(s)
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !resolvedDates.start || !resolvedDates.end}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
