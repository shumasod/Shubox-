<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class RateLimitServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Per-user API rate limit: 120 requests/minute
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by(
                $request->user()?->id ?: $request->ip()
            )->response(function () {
                return response()->json([
                    'message' => 'Too many requests. Please retry after a moment.',
                    'code'    => 'RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });

        // Per-tenant rate limit: 1000 requests/minute across all users
        RateLimiter::for('api.tenant', function (Request $request) {
            $tenantId = $request->user()?->tenant_id ?? 'anonymous';
            return Limit::perMinute(1000)->by("tenant:{$tenantId}")->response(function () {
                return response()->json([
                    'message' => 'Tenant API rate limit exceeded.',
                    'code'    => 'TENANT_RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });

        // Strict limit for auth endpoints: 10 attempts/minute per IP
        RateLimiter::for('auth', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perHour(50)->by($request->ip()),
            ];
        });

        // Export endpoints: 5 per hour per user (expensive operations)
        RateLimiter::for('exports', function (Request $request) {
            return Limit::perHour(5)->by(
                $request->user()?->id ?: $request->ip()
            )->response(function () {
                return response()->json([
                    'message' => 'Export limit reached. You may generate up to 5 exports per hour.',
                    'code'    => 'EXPORT_RATE_LIMIT_EXCEEDED',
                ], 429);
            });
        });

        // Webhook signature failures: block IP after 20 bad sigs in 5 minutes
        RateLimiter::for('webhook.invalid', function (Request $request) {
            return Limit::perMinutes(5, 20)->by($request->ip());
        });
    }
}
