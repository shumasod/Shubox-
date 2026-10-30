<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('auth');
    }

    public function test_auth_endpoint_rate_limited_after_threshold(): void
    {
        // Exhaust the auth rate limit
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/auth/login', [
                'email'    => 'nonexistent@example.com',
                'password' => 'wrong',
            ]);
        }

        $this->postJson('/api/auth/login', [
            'email'    => 'nonexistent@example.com',
            'password' => 'wrong',
        ])->assertStatus(429);
    }

    public function test_api_returns_rate_limit_headers(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);

        $response = $this->actingAs($user)->getJson('/api/expenses');

        $response->assertHeader('X-RateLimit-Limit');
        $response->assertHeader('X-RateLimit-Remaining');
    }

    public function test_export_rate_limited_per_user(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);
        RateLimiter::clear("exports:{$user->id}");

        // Exhaust export limit
        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($user)->postJson('/api/exports/expenses');
        }

        $this->actingAs($user)
            ->postJson('/api/exports/expenses')
            ->assertStatus(429)
            ->assertJsonPath('code', 'EXPORT_RATE_LIMIT_EXCEEDED');
    }
}
