<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache'    => $this->checkCache(),
            'storage'  => $this->checkStorage(),
        ];

        $allHealthy = collect($checks)->every(fn($c) => $c['status'] === 'ok');

        return response()->json([
            'status'  => $allHealthy ? 'ok' : 'degraded',
            'version' => config('app.version', '1.0.0'),
            'checks'  => $checks,
        ], $allHealthy ? 200 : 503);
    }

    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::selectOne('SELECT 1');
            $ms = round((microtime(true) - $start) * 1000, 2);
            return ['status' => 'ok', 'response_ms' => $ms];
        } catch (Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkCache(): array
    {
        try {
            $key = 'health:' . getmypid();
            Cache::put($key, 1, 10);
            $ok = Cache::get($key) === 1;
            Cache::forget($key);
            return ['status' => $ok ? 'ok' : 'error'];
        } catch (Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkStorage(): array
    {
        try {
            $path = 'health-check-' . getmypid() . '.txt';
            file_put_contents(storage_path('app/' . $path), '1');
            $ok = file_exists(storage_path('app/' . $path));
            @unlink(storage_path('app/' . $path));
            return ['status' => $ok ? 'ok' : 'error'];
        } catch (Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
