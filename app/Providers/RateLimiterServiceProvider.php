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
        $this->configureRateLimiters();
    }

    private function configureRateLimiters(): void
    {
        // General API: 300 req/min per user (or IP for unauthenticated)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(300)
                ->by($request->user()?->id ?? $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'リクエストが多すぎます。しばらくしてから再試行してください。',
                ], 429));
        });

        // Auth endpoints: 10 req/min per IP (brute-force protection)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'message' => 'ログイン試行が多すぎます。1分後に再試行してください。',
                ], 429));
        });

        // File upload: 20 req/min per user
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(20)
                ->by($request->user()?->id ?? $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'アップロードの制限に達しました。しばらくしてから再試行してください。',
                ], 429));
        });

        // Report export: 5 req/min per user (heavy operation)
        RateLimiter::for('exports', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?? $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'エクスポート要求が多すぎます。しばらくしてから再試行してください。',
                ], 429));
        });

        // Webhook dispatch: 60 req/min per tenant
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->tenant_id ?? $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Webhook配信の制限に達しました。',
                ], 429));
        });
    }
}
