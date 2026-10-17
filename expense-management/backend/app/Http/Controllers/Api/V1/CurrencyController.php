<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CurrencyConversionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function __construct(private readonly CurrencyConversionService $fx)
    {
    }

    public function rates(): JsonResponse
    {
        $currencies = $this->fx->getSupportedCurrencies();
        $rates      = [];

        foreach ($currencies as $currency) {
            if ($currency !== 'JPY') {
                $rates[$currency] = $this->fx->getRate($currency);
            }
        }

        return response()->json([
            'base'  => 'JPY',
            'rates' => $rates,
        ]);
    }

    public function convert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount'   => 'required|numeric|min:0',
            'from'     => 'required|string|size:3',
            'to'       => 'required|string|size:3',
        ]);

        $jpy    = $this->fx->toJpy($data['amount'], strtoupper($data['from']));
        $result = $this->fx->fromJpy($jpy, strtoupper($data['to']));

        return response()->json([
            'from'   => strtoupper($data['from']),
            'to'     => strtoupper($data['to']),
            'amount' => (float) $data['amount'],
            'result' => $result,
            'rate'   => round($result / max($data['amount'], 0.0001), 6),
        ]);
    }
}
