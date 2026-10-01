import React, { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type RatesResponse = {
  base: string;
  rates: Record<string, number>;
  updated_at: string | null;
};

const CURRENCIES = ['JPY', 'USD', 'EUR', 'GBP', 'CNY', 'KRW', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF'];

function toJPY(amount: number, currency: string, rates: Record<string, number>): number | null {
  if (!amount || isNaN(amount)) return null;
  if (currency === 'JPY') return amount;
  const rate = rates[currency];
  if (!rate) return null;
  return Math.round(amount / rate);
}

interface CurrencySelectorProps {
  amount: number | '';
  currency: string;
  onCurrencyChange: (currency: string) => void;
  disabled?: boolean;
}

export function CurrencySelector({
  amount,
  currency,
  onCurrencyChange,
  disabled = false,
}: CurrencySelectorProps) {
  const selectId   = useId();
  const previewId  = useId();

  const { data: ratesData } = useQuery<RatesResponse>({
    queryKey: ['exchange-rates'],
    queryFn: () => api.get('/currency/rates').then(r => r.data),
    staleTime: 60 * 60_000, // 1 hour
  });

  const jpyEquiv = ratesData && amount !== '' && currency !== 'JPY'
    ? toJPY(Number(amount), currency, ratesData.rates)
    : null;

  const formatted = jpyEquiv !== null
    ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(jpyEquiv)
    : null;

  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={selectId} className="sr-only">通貨</label>
      <select
        id={selectId}
        value={currency}
        onChange={e => onCurrencyChange(e.target.value)}
        disabled={disabled}
        aria-describedby={formatted ? previewId : undefined}
        className="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      >
        {CURRENCIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {formatted && (
        <p id={previewId} className="text-xs text-gray-400 dark:text-gray-500">
          ≈ {formatted}
          {ratesData?.updated_at && (
            <span className="ml-1">
              ({new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                .format(new Date(ratesData.updated_at))} 時点)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
