<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

class HealthCheckController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks  = [];
        $healthy = true;

        // Database
        $checks['database'] = $this->checkDatabase();

        // Redis / Cache
        $checks['cache'] = $this->checkCache();

        // S3
        $checks['storage'] = $this->checkStorage();

        // Queue depth (warn if SQS backlog is high)
        $checks['queue'] = $this->checkQueue();

        foreach ($checks as $check) {
            if ($check['status'] !== 'ok') {
                $healthy = false;
                break;
            }
        }

        $statusCode = $healthy ? 200 : 503;

        return response()->json([
            'status'  => $healthy ? 'healthy' : 'degraded',
            'checks'  => $checks,
            'version' => config('app.version', 'unknown'),
        ], $statusCode);
    }

    public function readiness(): JsonResponse
    {
        // Lightweight check for ALB target health and ECS task readiness
        try {
            DB::selectOne('SELECT 1');
            return response()->json(['status' => 'ready'], 200);
        } catch (\Throwable) {
            return response()->json(['status' => 'not ready'}, 503);
        }
    }

    public function liveness(): JsonResponse
    {
        // Pure liveness: process is alive and responding
        return response()->json(['status' => 'alive'], 200);
    }

    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::selectOne('SELECT 1');
            $latencyMs = round((microtime(true) - $start) * 1000, 2);

            return ['status' => 'ok', 'latency_ms' => $latencyMs];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkCache(): array
    {
        try {
            $key   = 'healthcheck:' . uniqid();
            $start = microtime(true);
            Cache::put($key, '1', 10);
            $value     = Cache::get($key);
            $latencyMs = round((microtime(true) - $start) * 1000, 2);
            Cache::forget($key);

            if ($value !== '1') {
                return ['status' => 'error', 'message' => 'Cache read/write mismatch'];
            }

            return ['status' => 'ok', 'latency_ms' => $latencyMs];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkStorage(): array
    {
        try {
            $key   = 'healthcheck/' . uniqid() . '.txt';
            $start = microtime(true);
            Storage::disk('s3')->put($key, 'ok', ['ServerSideEncryption' => 'aws:kms']);
            $content   = Storage::disk('s3')->get($key);
            $latencyMs = round((microtime(true) - $start) * 1000, 2);
            Storage::disk('s3')->delete($key);

            if ($content !== 'ok') {
                return ['status' => 'error', 'message' => 'S3 read/write mismatch'];
            }

            return ['status' => 'ok', 'latency_ms' => $latencyMs];
        } catch (\Throwable $e) {
            return ['status' => 'degraded', 'message' => $e->getMessage()];
        }
    }

    private function checkQueue(): array
    {
        try {
            $size = Queue::size('default');

            $status = $size > 1000 ? 'degraded' : 'ok';

            return ['status' => $status, 'depth' => $size];
        } catch (\Throwable $e) {
            return ['status' => 'degraded', 'message' => $e->getMessage()];
        }
    }
}
