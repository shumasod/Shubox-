import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (id: string, hasError: boolean) => React.ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className = '' }: FormFieldProps) {
  const id = useId();
  const hasError = !!error;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {children(id, hasError)}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const baseInput = (hasError: boolean) =>
  [
    'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 dark:text-white',
    'bg-white dark:bg-gray-800 placeholder-gray-400',
    'focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-400 focus:ring-red-400 dark:border-red-500'
      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500',
  ].join(' ');

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, required, className, ...props }: InputProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(id, hasError) => (
        <input
          id={id}
          {...props}
          required={required}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={baseInput(hasError)}
        />
      )}
    </FormField>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function SelectField({ label, error, hint, required, options, placeholder, className, ...props }: SelectProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(id, hasError) => (
        <select
          id={id}
          {...props}
          required={required}
          aria-invalid={hasError}
          className={`${baseInput(hasError)} pr-8 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMTIgOCI+PHBhdGggZD0iTTEgMWw1IDUgNS01IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+PC9zdmc+')] bg-no-repeat bg-[right_10px_center]`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </FormField>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextareaField({ label, error, hint, required, className, ...props }: TextareaProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(id, hasError) => (
        <textarea
          id={id}
          {...props}
          required={required}
          aria-invalid={hasError}
          rows={props.rows ?? 3}
          className={`${baseInput(hasError)} resize-y`}
        />
      )}
    </FormField>
  );
}

interface AmountFieldProps extends Omit<InputProps, 'type'> {
  currency?: string;
}

export function AmountField({ label, error, hint, required, currency = 'JPY', className, ...props }: AmountFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className}>
      {(id, hasError) => (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">
            {currency === 'JPY' ? '￥' : currency === 'USD' ? '$' : currency}
          </span>
          <input
            id={id}
            type="number"
            min="0"
            step="1"
            {...props}
            required={required}
            aria-invalid={hasError}
            className={`${baseInput(hasError)} pl-8 tabular-nums`}
          />
        </div>
      )}
    </FormField>
  );
}
