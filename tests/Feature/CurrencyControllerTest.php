<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CurrencyControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
    }

    public function test_rates_returns_jpy_base(): void
    {
        Cache::put('exchange_rates', ['USD' => 0.0067, 'EUR' => 0.0062], 3600);

        $this->actingAs($this->user)
            ->getJson('/api/currency/rates')
            ->assertOk()
            ->assertJsonPath('base', 'JPY')
            ->assertJsonStructure(['base', 'rates']);
    }

    public function test_convert_same_currency_returns_same_amount(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/currency/convert?amount=1000&from=JPY&to=JPY')
            ->assertOk()
            ->assertJsonPath('rate', 1.0)
            ->assertJsonPath('converted', 1000);
    }

    public function test_convert_usd_to_jpy(): void
    {
        Cache::put('exchange_rates', ['USD' => 0.0067], 3600);

        $response = $this->actingAs($this->user)
            ->getJson('/api/currency/convert?amount=100&from=USD&to=JPY')
            ->assertOk();

        // 100 USD * (1 / 0.0067) = ~14925 JPY
        $this->assertGreaterThan(10000, $response->json('converted'));
    }

    public function test_unsupported_currency_returns_422(): void
    {
        Cache::put('exchange_rates', ['USD' => 0.0067], 3600);

        $this->actingAs($this->user)
            ->getJson('/api/currency/convert?amount=100&from=XYZ&to=JPY')
            ->assertUnprocessable();
    }
}
