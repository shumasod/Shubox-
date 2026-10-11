<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks  = [];
        $healthy = true;

        // Database
        [$ok, $latency] = $this->checkDatabase();
        $checks['database'] = ['status' => $ok ? 'ok' : 'error', 'latency_ms' => $latency];
        if (!$ok) $healthy = false;

        // Redis / Cache
        [$ok, $latency] = $this->checkCache();
        $checks['cache'] = ['status' => $ok ? 'ok' : 'error', 'latency_ms' => $latency];
        if (!$ok) $healthy = false;

        // S3
        [$ok, $latency] = $this->checkS3();
        $checks['storage'] = ['status' => $ok ? 'ok' : 'error', 'latency_ms' => $latency];
        // S3 is degraded, not fatal

        // Queue depth (SQS/Redis)
        $checks['queue'] = $this->checkQueue();

        $statusCode = $healthy ? 200 : 503;

        return response()->json([
            'status'  => $healthy ? 'healthy' : 'degraded',
            'checks'  => $checks,
            'version' => config('app.version', 'unknown'),
            'env'     => app()->environment(),
        ], $statusCode);
    }

    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            return [true, round((microtime(true) - $start) * 1000, 2)];
        } catch (\Throwable) {
            return [false, null];
        }
    }

    private function checkCache(): array
    {
        try {
            $key   = '_health_check_' . uniqid();
            $start = microtime(true);
            Cache::put($key, 1, 10);
            $val   = Cache::get($key);
            Cache::forget($key);
            $latency = round((microtime(true) - $start) * 1000, 2);
            return [$val === 1, $latency];
        } catch (\Throwable) {
            return [false, null];
        }
    }

    private function checkS3(): array
    {
        try {
            $key   = '_health/' . uniqid();
            $start = microtime(true);
            Storage::disk('s3')->put($key, 'ok');
            Storage::disk('s3')->delete($key);
            return [true, round((microtime(true) - $start) * 1000, 2)];
        } catch (\Throwable) {
            return [false, null];
        }
    }

    private function checkQueue(): array
    {
        try {
            $size = Queue::size('default');
            return ['status' => 'ok', 'depth' => $size];
        } catch (\Throwable) {
            return ['status' => 'error', 'depth' => null];
        }
    }
}
