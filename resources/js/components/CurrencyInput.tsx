import React, { useId, useRef, useState } from 'react';

interface CurrencyInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  currency?: string;
  locale?: string;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

const FRACTION_DIGITS: Record<string, number> = {
  JPY: 0, KRW: 0, CLP: 0, ISK: 0, HUF: 0,
  // All others default to 2
};

function getFractionDigits(currency: string): number {
  return FRACTION_DIGITS[currency.toUpperCase()] ?? 2;
}

function formatDisplayValue(raw: number | '', currency: string, locale: string): string {
  if (raw === '' || raw === null || raw === undefined) return '';
  const digits = getFractionDigits(currency);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(raw);
}

function parseInputValue(str: string): number | '' {
  const cleaned = str.replace(/[^0-9.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return '';
  const n = parseFloat(cleaned);
  return isNaN(n) ? '' : n;
}

export default function CurrencyInput({
  value,
  onChange,
  currency = 'JPY',
  locale = 'ja-JP',
  label,
  placeholder,
  min,
  max,
  required = false,
  disabled = false,
  error,
  hint,
  className = '',
}: CurrencyInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = getFractionDigits(currency);

  // Raw edit value while typing
  const [rawInput, setRawInput] = useState<string>('');

  const displayValue = focused
    ? rawInput
    : formatDisplayValue(value, currency, locale);

  const handleFocus = () => {
    setFocused(true);
    setRawInput(value === '' ? '' : String(value));
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseInputValue(rawInput);
    if (parsed !== '') {
      const clamped = Math.min(
        max ?? Infinity,
        Math.max(min ?? -Infinity, parsed)
      );
      const rounded = parseFloat(clamped.toFixed(digits));
      onChange(rounded);
    } else {
      onChange('');
    }
    setRawInput('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(e.target.value);
  };

  const currencySymbol = new Intl.NumberFormat(locale, {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(0).replace(/[\d,.  ]/g, '').trim();

  const hasError = !!error;
  const inputClass = [
    'block w-full rounded-lg border py-2 pl-8 pr-3 text-sm transition-colors',
    'focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:text-red-400'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600',
    'bg-white dark:bg-gray-700 dark:text-gray-100',
    disabled ? 'cursor-not-allowed opacity-60' : '',
    className,
  ].join(' ');

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
        </label>
      )}

      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-gray-500 dark:text-gray-400"
          aria-hidden
        >
          {currencySymbol}
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          placeholder={placeholder ?? (digits === 0 ? '0' : '0.00')}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={inputClass}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        <span
          className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs font-medium text-gray-400 dark:text-gray-500"
          aria-hidden
        >
          {currency}
        </span>
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}
