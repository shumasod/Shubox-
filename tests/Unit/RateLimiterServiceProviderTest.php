<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RateLimiterServiceProviderTest extends TestCase
{
    public function test_api_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('api') !== null);
    }

    public function test_auth_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('auth') !== null);
    }

    public function test_exports_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('exports') !== null);
    }

    public function test_webhook_invalid_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('webhook.invalid') !== null);
    }

    public function test_api_tenant_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('api.tenant') !== null);
    }

    public function test_auth_limiter_returns_429_on_too_many_requests(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/api/auth/login', [
                'email'    => 'test@example.com',
                'password' => 'wrong',
            ]);
        }

        $response->assertStatus(429);
    }
}
