<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class RateLimiterServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->configureApiLimiter();
        $this->configureApiTenantLimiter();
        $this->configureAuthLimiter();
        $this->configureExportsLimiter();
        $this->configureWebhookInvalidLimiter();
    }

    /**
     * General API rate limit: 60 req/min per authenticated user.
     * Falls back to IP for unauthenticated requests.
     */
    private function configureApiLimiter(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(60)->by($request->user()->id)
                : Limit::perMinute(20)->by($request->ip());
        });
    }

    /**
     * Per-tenant API rate limit: 600 req/min across the whole tenant.
     * Prevents one tenant from starving others on shared infrastructure.
     */
    private function configureApiTenantLimiter(): void
    {
        RateLimiter::for('api.tenant', function (Request $request) {
            $tenantId = $request->user()?->tenant_id;

            if (! $tenantId) {
                return Limit::none();
            }

            return Limit::perMinute(600)->by("tenant:{$tenantId}");
        });
    }

    /**
     * Auth endpoints: 5 attempts per minute per IP.
     * Applies to login, password reset, and 2FA verify.
     */
    private function configureAuthLimiter(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many authentication attempts. Please try again later.',
                    ], 429);
                });
        });
    }

    /**
     * Export endpoint: 5 exports per 10 minutes per user.
     * Exports are expensive — queue-based but still guarded.
     */
    private function configureExportsLimiter(): void
    {
        RateLimiter::for('exports', function (Request $request) {
            return $request->user()
                ? Limit::perMinutes(10, 5)->by($request->user()->id)
                : Limit::perMinutes(10, 1)->by($request->ip());
        });
    }

    /**
     * Webhook invalid-signature backoff: track per endpoint + IP.
     * After 20 invalid signatures in 5 min, the IP is effectively blocked.
     */
    private function configureWebhookInvalidLimiter(): void
    {
        RateLimiter::for('webhook.invalid', function (Request $request) {
            $endpointId = $request->route('endpointId', 'unknown');

            return Limit::perMinutes(5, 20)
                ->by($request->ip() . ':' . $endpointId);
        });
    }
}
