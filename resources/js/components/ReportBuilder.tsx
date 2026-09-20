import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface Column {
  key: string;
  label: string;
  group: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportConfig {
  name: string;
  columns: string[];
  filters: ReportFilter[];
  groupBy?: string;
  dateFrom: string;
  dateTo: string;
  format: 'csv' | 'xlsx' | 'pdf';
}

const AVAILABLE_COLUMNS: Column[] = [
  { key: 'id',           label: 'ID',              group: 'Expense' },
  { key: 'title',        label: 'Title',            group: 'Expense' },
  { key: 'amount',       label: 'Amount',           group: 'Expense' },
  { key: 'currency',     label: 'Currency',         group: 'Expense' },
  { key: 'expense_date', label: 'Date',             group: 'Expense' },
  { key: 'status',       label: 'Status',           group: 'Expense' },
  { key: 'description',  label: 'Description',      group: 'Expense' },
  { key: 'category',     label: 'Category',         group: 'Classification' },
  { key: 'vendor',       label: 'Vendor',           group: 'Classification' },
  { key: 'tags',         label: 'Tags',             group: 'Classification' },
  { key: 'submitter',    label: 'Submitted By',     group: 'People' },
  { key: 'department',   label: 'Department',       group: 'People' },
  { key: 'approver',     label: 'Approved By',      group: 'People' },
  { key: 'approved_at',  label: 'Approved At',      group: 'Dates' },
  { key: 'created_at',   label: 'Created At',       group: 'Dates' },
];

const FILTER_FIELDS = [
  { key: 'status',       label: 'Status' },
  { key: 'category_id',  label: 'Category' },
  { key: 'vendor_id',    label: 'Vendor' },
  { key: 'amount',       label: 'Amount' },
  { key: 'department_id',label: 'Department' },
];

const OPERATORS = [
  { key: 'eq',  label: '=' },
  { key: 'neq', label: '≠' },
  { key: 'gt',  label: '>' },
  { key: 'lt',  label: '<' },
  { key: 'contains', label: 'contains' },
];

const GROUP_LABELS = [...new Set(AVAILABLE_COLUMNS.map((c) => c.group))];

function ColumnPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (cols: string[]) => void;
}) {
  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

  return (
    <div className="space-y-3">
      {GROUP_LABELS.map((group) => (
        <div key={group}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {group}
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLUMNS.filter((c) => c.group === group).map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => toggle(col.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selected.includes(col.key)
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterRow({
  filter,
  index,
  onChange,
  onRemove,
}: {
  filter: ReportFilter;
  index: number;
  onChange: (i: number, f: ReportFilter) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={filter.field}
        onChange={(e) => onChange(index, { ...filter, field: e.target.value })}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      >
        {FILTER_FIELDS.map((f) => (
          <option key={f.key} value={f.key}>{f.label}</option>
        ))}
      </select>
      <select
        value={filter.operator}
        onChange={(e) => onChange(index, { ...filter, operator: e.target.value })}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      >
        {OPERATORS.map((op) => (
          <option key={op.key} value={op.key}>{op.label}</option>
        ))}
      </select>
      <input
        type="text"
        value={filter.value}
        onChange={(e) => onChange(index, { ...filter, value: e.target.value })}
        placeholder="Value"
        className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="rounded p-1 text-gray-400 hover:text-red-500"
        aria-label="Remove filter"
      >
        ×
      </button>
    </div>
  );
}

export default function ReportBuilder() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 7) + '-01';

  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    columns: ['title', 'amount', 'expense_date', 'status', 'category', 'submitter'],
    filters: [],
    dateFrom: firstOfMonth,
    dateTo: today,
    format: 'csv',
  });

  const generate = useMutation({
    mutationFn: (cfg: ReportConfig) =>
      fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      }).then((r) => r.json()),
  });

  const addFilter = () =>
    setConfig((c) => ({
      ...c,
      filters: [...c.filters, { field: 'status', operator: 'eq', value: '' }],
    }));

  const updateFilter = (i: number, f: ReportFilter) =>
    setConfig((c) => {
      const filters = [...c.filters];
      filters[i] = f;
      return { ...c, filters };
    });

  const removeFilter = (i: number) =>
    setConfig((c) => ({ ...c, filters: c.filters.filter((_, idx) => idx !== i) }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Builder</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-200">Report Name & Date Range</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400">Report name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))}
              placeholder="Monthly Expense Summary"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400">From</label>
            <input
              type="date"
              value={config.dateFrom}
              onChange={(e) => setConfig((c) => ({ ...c, dateFrom: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400">To</label>
            <input
              type="date"
              value={config.dateTo}
              onChange={(e) => setConfig((c) => ({ ...c, dateTo: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-200">Columns</h2>
        <ColumnPicker
          selected={config.columns}
          onChange={(columns) => setConfig((c) => ({ ...c, columns }))}
        />
        <p className="mt-2 text-xs text-gray-400">{config.columns.length} columns selected</p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Filters</h2>
          <button
            type="button"
            onClick={addFilter}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            + Add filter
          </button>
        </div>
        <div className="space-y-2">
          {config.filters.length === 0 ? (
            <p className="text-sm text-gray-400">No filters applied — all expenses will be included.</p>
          ) : (
            config.filters.map((f, i) => (
              <FilterRow key={i} filter={f} index={i} onChange={updateFilter} onRemove={removeFilter} />
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-200">Output Format</h2>
        <div className="flex gap-3">
          {(['csv', 'xlsx', 'pdf'] as const).map((fmt) => (
            <label key={fmt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={fmt}
                checked={config.format === fmt}
                onChange={() => setConfig((c) => ({ ...c, format: fmt }))}
              />
              <span className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">{fmt}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => generate.mutate(config)}
          disabled={generate.isPending || config.columns.length === 0}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {generate.isPending ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {generate.isSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-700/30 dark:bg-green-900/20 dark:text-green-400">
          Report queued. You will receive a download link by email when it is ready.
        </div>
      )}
    </div>
  );
}
