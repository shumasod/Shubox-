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
}
