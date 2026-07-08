<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    private function configureRateLimiting(): void
    {
        // Auth endpoints — strict per-IP limit to block brute-force
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip())->response(
                fn() => response()->json([
                    'message' => 'Too many login attempts. Please wait before trying again.',
                    'retry_after' => 60,
                ], 429)
            );
        });

        // General API — per-user (authenticated) or per-IP (guest)
        RateLimiter::for('api', function (Request $request) {
            $key = $request->user()
                ? 'user:' . $request->user()->id
                : 'ip:' . $request->ip();

            return Limit::perMinute(120)->by($key)->response(
                fn() => response()->json([
                    'message' => 'Too many requests.',
                    'retry_after' => 60,
                ], 429)
            );
        });

        // Upload endpoints — lower limit to prevent storage abuse
        RateLimiter::for('upload', function (Request $request) {
            return Limit::perMinute(20)
                ->by('upload:' . ($request->user()?->id ?? $request->ip()))
                ->response(
                    fn() => response()->json([
                        'message' => 'Upload rate limit exceeded.',
                        'retry_after' => 60,
                    ], 429)
                );
        });

        // Export endpoints — allow only 5 per minute to protect server resources
        RateLimiter::for('export', function (Request $request) {
            return Limit::perMinute(5)
                ->by('export:' . ($request->user()?->id ?? $request->ip()))
                ->response(
                    fn() => response()->json([
                        'message' => 'Export rate limit exceeded. Please wait before requesting another export.',
                        'retry_after' => 60,
                    ], 429)
                );
        });

        // Per-tenant rate limit — prevent one tenant from monopolising shared resources
        RateLimiter::for('tenant', function (Request $request) {
            $tenantId = $request->user()?->tenant_id ?? 'guest';
            return Limit::perMinute(500)->by('tenant:' . $tenantId);
        });
    }
}
