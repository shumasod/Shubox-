import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface DateRange {
  start: string | null;
  end: string | null;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  maxDate?: string;
  minDate?: string;
}

const MONTHS_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function pad(n: number) { return String(n).padStart(2, '0'); }
function toISO(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DateRangePicker({ value, onChange, placeholder = 'Select date range', className = '', maxDate, minDate }: Props) {
  const today   = new Date();
  const [open, setOpen]             = useState(false);
  const [viewYear, setViewYear]     = useState(today.getFullYear());
  const [viewMonth, setViewMonth]   = useState(today.getMonth());
  const [hoveredDate, setHovered]   = useState<string | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const handleDayClick = useCallback((iso: string) => {
    if (!value.start || (value.start && value.end)) {
      onChange({ start: iso, end: null });
    } else {
      if (iso < value.start) {
        onChange({ start: iso, end: value.start });
      } else {
        onChange({ start: value.start, end: iso });
      }
      setOpen(false);
    }
  }, [value, onChange]);

  const inRange = (iso: string): boolean => {
    if (!value.start) return false;
    const end = value.end ?? hoveredDate;
    if (!end) return false;
    const [s, e] = value.start <= end ? [value.start, end] : [end, value.start];
    return iso > s && iso < e;
  };

  const isStart = (iso: string) => iso === value.start;
  const isEnd   = (iso: string) => iso === value.end;

  const displayText = value.start && value.end
    ? `${value.start} ~ ${value.end}`
    : value.start ? `${value.start} ~` : '';

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={displayText ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {displayText || placeholder}
        </span>
        {(value.start || value.end) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange({ start: null, end: null }); }}
            className="ml-auto text-gray-400 hover:text-gray-600"
            aria-label="Clear dates"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {viewYear}年 {MONTHS_JA[viewMonth]}
            </span>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const iso = toISO(viewYear, viewMonth, day);
              const start = isStart(iso);
              const end   = isEnd(iso);
              const range = inRange(iso);
              const disabled = (minDate && iso < minDate) || (maxDate && iso > maxDate);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!!disabled}
                  onClick={() => !disabled && handleDayClick(iso)}
                  onMouseEnter={() => setHovered(iso)}
                  onMouseLeave={() => setHovered(null)}
                  className={[
                    'text-xs py-1.5 text-center transition-colors relative',
                    disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer',
                    start || end ? 'bg-indigo-600 text-white rounded-full font-semibold' : '',
                    range ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : '',
                    !start && !end && !range && !disabled ? 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full' : '',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
