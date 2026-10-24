<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyConversionService
{
    private const CACHE_TTL   = 3600; // 1 hour
    private const CACHE_KEY   = 'exchange_rates_jpy_base';
    private const FALLBACK    = ['USD' => 150.0, 'EUR' => 163.0, 'GBP' => 190.0, 'CNY' => 21.0];

    /**
     * Convert an amount in the given currency to JPY.
     */
    public function toJpy(int|float $amount, string $fromCurrency): int
    {
        if ($fromCurrency === 'JPY') {
            return (int) round($amount);
        }

        $rate = $this->getRate($fromCurrency);
        return (int) round($amount * $rate);
    }

    /**
     * Convert an amount in JPY to the target currency.
     */
    public function fromJpy(int $amountJpy, string $toCurrency): float
    {
        if ($toCurrency === 'JPY') {
            return (float) $amountJpy;
        }

        $rate = $this->getRate($toCurrency);
        return round($amountJpy / $rate, 2);
    }

    /**
     * Get the JPY exchange rate for the given currency (JPY per 1 unit of currency).
     */
    public function getRate(string $currency): float
    {
        $rates = $this->fetchRates();
        return (float) ($rates[$currency] ?? self::FALLBACK[$currency] ?? 1.0);
    }

    public function getSupportedCurrencies(): array
    {
        return array_keys(array_merge(self::FALLBACK, $this->fetchRates()));
    }

    private function fetchRates(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            $apiUrl = config('services.exchange_rate.url', '');
            $apiKey = config('services.exchange_rate.key', '');

            if (empty($apiUrl) || empty($apiKey)) {
                Log::warning('Exchange rate API not configured; using fallback rates.');
                return self::FALLBACK;
            }

            try {
                $response = Http::timeout(5)->get($apiUrl, [
                    'base'    => 'JPY',
                    'api_key' => $apiKey,
                ]);

                if ($response->successful()) {
                    return $response->json('rates', self::FALLBACK);
                }
            } catch (\Throwable $e) {
                Log::error('Failed to fetch exchange rates', ['error' => $e->getMessage()]);
            }

            return self::FALLBACK;
        });
    }
}
