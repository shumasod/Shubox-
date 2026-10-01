<?php

namespace Tests\Unit;

use App\Services\CurrencyConversionService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CurrencyConversionServiceTest extends TestCase
{
    private CurrencyConversionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CurrencyConversionService();
        Cache::flush();
    }

    public function test_same_currency_returns_unchanged_amount(): void
    {
        $result = $this->service->convert(10000, 'JPY', 'JPY');
        $this->assertSame(10000, $result);
    }

    public function test_convert_uses_fetched_rate(): void
    {
        Http::fake([
            'api.exchangerate-api.com/*' => Http::response([
                'rates' => ['JPY' => 150.0],
            ], 200),
        ]);

        // 100 USD * 150 = 15000 JPY (in lowest units: 10000 cents * 150 = 1,500,000)
        $result = $this->service->convert(10000, 'USD', 'JPY');
        $this->assertSame(1_500_000, $result);
    }

    public function test_rate_is_cached_after_first_fetch(): void
    {
        Http::fake([
            'api.exchangerate-api.com/*' => Http::response(['rates' => ['JPY' => 150.0]], 200),
        ]);

        $this->service->getRate('USD', 'JPY');
        $this->service->getRate('USD', 'JPY');

        // Only 1 HTTP request should have been made
        Http::assertSentCount(1);
    }

    public function test_fallback_rate_used_on_provider_failure(): void
    {
        Http::fake([
            'api.exchangerate-api.com/*' => Http::response(null, 500),
        ]);

        // Should not throw; fallback rates used
        $rate = $this->service->getRate('USD', 'JPY');
        $this->assertGreaterThan(0, $rate);
    }

    public function test_get_supported_currencies_returns_array(): void
    {
        $currencies = $this->service->getSupportedCurrencies();
        $this->assertContains('JPY', $currencies);
        $this->assertContains('USD', $currencies);
        $this->assertContains('EUR', $currencies);
    }

    public function test_convert_rounds_to_integer(): void
    {
        Http::fake([
            'api.exchangerate-api.com/*' => Http::response(['rates' => ['USD' => 0.00667]], 200),
        ]);

        $result = $this->service->convert(100, 'JPY', 'USD');
        $this->assertIsInt($result);
    }

    public function test_zero_amount_returns_zero(): void
    {
        Http::fake([
            'api.exchangerate-api.com/*' => Http::response(['rates' => ['USD' => 0.00667]], 200),
        ]);

        $result = $this->service->convert(0, 'JPY', 'USD');
        $this->assertSame(0, $result);
    }
}
