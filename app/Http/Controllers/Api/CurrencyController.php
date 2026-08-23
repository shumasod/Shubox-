<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyConversionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function __construct(private readonly CurrencyConversionService $fx) {}

    public function rates(Request $request): JsonResponse
    {
        $request->validate(['base' => 'nullable|string|size:3']);
        $base = strtoupper($request->query('base', 'JPY'));

        $currencies = $this->fx->getSupportedCurrencies();
        $rates = [];
        foreach (array_filter($currencies, fn ($c) => $c !== $base) as $to) {
            $rates[$to] = $this->fx->getRate($base, $to);
        }

        return response()->json([
            'base'  => $base,
            'rates' => $rates,
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CurrencyController extends Controller
{
    private const CACHE_TTL   = 3600; // 1 hour
    private const BASE        = 'JPY';
    private const SUPPORTED   = ['USD', 'EUR', 'GBP', 'CNY', 'KRW', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF'];

    public function rates(): JsonResponse
    {
        $rates = Cache::remember('exchange_rates', self::CACHE_TTL, function () {
            return $this->fetchRates();
        });

        return response()->json([
            'base'       => self::BASE,
            'rates'      => $rates,
            'updated_at' => Cache::get('exchange_rates_updated_at'),
        ]);
    }

    public function convert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount'   => 'required|integer|min:0',
            'from'     => 'required|string|size:3',
            'to'       => 'required|string|size:3',
        ]);

        $converted = $this->fx->convert((int) $data['amount'], strtoupper($data['from']), strtoupper($data['to']));

        return response()->json([
            'original'  => $data['amount'],
            'converted' => $converted,
            'from'      => strtoupper($data['from']),
            'to'        => strtoupper($data['to']),
            'rate'      => $this->fx->getRate(strtoupper($data['from']), strtoupper($data['to'])),
        ]);
    }
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'from'   => 'required|string|size:3',
            'to'     => 'nullable|string|size:3',
        ]);

        $from = strtoupper($validated['from']);
        $to   = strtoupper($validated['to'] ?? self::BASE);

        if ($from === $to) {
            return response()->json([
                'amount'         => $validated['amount'],
                'converted'      => $validated['amount'],
                'from'           => $from,
                'to'             => $to,
                'rate'           => 1.0,
            ]);
        }

        $rates = Cache::remember('exchange_rates', self::CACHE_TTL, function () {
            return $this->fetchRates();
        });

        // rates are all relative to JPY
        // amount in `from` → JPY → `to`
        $fromRate = $from === self::BASE ? 1.0 : ($rates[$from] ?? null);
        $toRate   = $to   === self::BASE ? 1.0 : ($rates[$to]   ?? null);

        if ($fromRate === null || $toRate === null) {
            return response()->json(['message' => 'Unsupported currency.'], 422);
        }

        $inJpy    = $validated['amount'] / $fromRate;  // to JPY
        $converted = $inJpy * $toRate;                  // to target currency

        return response()->json([
            'amount'    => $validated['amount'],
            'converted' => round($converted, 2),
            'from'      => $from,
            'to'        => $to,
            'rate'      => $toRate / $fromRate,
        ]);
    }

    public function supported(): JsonResponse
    {
        return response()->json(['currencies' => array_merge([self::BASE], self::SUPPORTED)]);
    }

    private function fetchRates(): array
    {
        // Attempt to use a free exchange-rate API; fall back to hardcoded defaults
        try {
            $response = Http::timeout(5)
                ->get('https://api.exchangerate-api.com/v4/latest/JPY');

            if ($response->successful()) {
                $data  = $response->json();
                $rates = [];

                foreach (self::SUPPORTED as $code) {
                    if (isset($data['rates'][$code])) {
                        $rates[$code] = $data['rates'][$code];
                    }
                }

                Cache::put('exchange_rates_updated_at', now()->toIso8601String(), self::CACHE_TTL);

                return $rates;
            }
        } catch (\Throwable) {
            // fall through to defaults
        }

        // Hardcoded fallback rates (JPY-based, approximate)
        return [
            'USD' => 0.0067, 'EUR' => 0.0062, 'GBP' => 0.0053,
            'CNY' => 0.048,  'KRW' => 8.9,    'HKD' => 0.052,
            'SGD' => 0.0090, 'AUD' => 0.010,  'CAD' => 0.0091,
            'CHF' => 0.0060,
        ];
    }
}
