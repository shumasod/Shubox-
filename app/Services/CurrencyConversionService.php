<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyConversionService
{
    private const CACHE_TTL_SECONDS = 3600;
    private const BASE_CURRENCY     = 'JPY';

    public function convert(int $amountInLowest, string $fromCurrency, string $toCurrency = self::BASE_CURRENCY): int
    {
        if ($fromCurrency === $toCurrency) {
            return $amountInLowest;
        }

        $rate = $this->getRate($fromCurrency, $toCurrency);

        return (int) round($amountInLowest * $rate);
    }

    public function getRate(string $from, string $to): float
    {
        $cacheKey = "fx_rate:{$from}:{$to}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($from, $to) {
            return $this->fetchRateFromProvider($from, $to);
        });
    }

    public function getSupportedCurrencies(): array
    {
        return ['JPY', 'USD', 'EUR', 'GBP', 'CNY', 'KRW', 'SGD', 'HKD', 'AUD', 'CAD'];
    }

    private function fetchRateFromProvider(string $from, string $to): float
    {
        try {
            $response = Http::timeout(5)->get(
                "https://api.exchangerate-api.com/v4/latest/{$from}"
            );

            if ($response->successful()) {
                return $response->json("rates.{$to}") ?? throw new \RuntimeException("Rate not found for {$to}");
            }
        } catch (\Throwable $e) {
            Log::warning('Exchange rate fetch failed', ['from' => $from, 'to' => $to, 'error' => $e->getMessage()]);
        }

        // Fallback to hardcoded approximate rates
        return $this->fallbackRate($from, $to);
    }

    private function fallbackRate(string $from, string $to): float
    {
        // Approximate rates relative to JPY (updated manually for fallback only)
        $toJpy = [
            'JPY' => 1.0, 'USD' => 150.0, 'EUR' => 163.0, 'GBP' => 190.0,
            'CNY' => 21.0, 'KRW' => 0.11, 'SGD' => 111.0, 'HKD' => 19.2,
            'AUD' => 99.0, 'CAD' => 110.0,
        ];

        $fromJpy = $toJpy[$from] ?? 1.0;
        $toJpyV  = $toJpy[$to]   ?? 1.0;

        return $fromJpy / $toJpyV;
    }
}
