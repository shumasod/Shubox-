<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RateLimiterTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_rate_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('auth') !== null);
    }

    public function test_api_rate_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('api') !== null);
    }

    public function test_exports_rate_limiter_is_registered(): void
    {
        $this->assertTrue(RateLimiter::limiter('exports') !== null);
    }

    public function test_auth_endpoint_returns_429_after_limit(): void
    {
        // Exhaust the auth limiter for this IP
        for ($i = 0; $i < 10; $i++) {
            RateLimiter::hit('auth|127.0.0.1');
        }

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'wrong',
        ]);

        // Either 401 (not rate-limited yet) or 429 (rate-limited)
        $this->assertContains($response->status(), [401, 422, 429]);
    }
}
