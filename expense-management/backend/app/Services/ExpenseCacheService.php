<?php

declare(strict_types=1);

namespace App\Services;

use App\Infrastructure\Persistence\Eloquent\Models\CategoryModel;
use Illuminate\Support\Facades\Cache;

class ExpenseCacheService
{
    private const TTL_CATEGORIES = 3600;    // 1 hour
    private const TTL_STATS      = 300;     // 5 minutes
    private const TTL_USER       = 600;     // 10 minutes

    public function getCategories(string $tenantId): array
    {
        return Cache::remember(
            "categories:{$tenantId}",
            self::TTL_CATEGORIES,
            fn () => CategoryModel::where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->toArray()
        );
    }

    public function invalidateCategories(string $tenantId): void
    {
        Cache::forget("categories:{$tenantId}");
    }

    public function getMonthlyStats(string $tenantId, int $year, int $month): ?array
    {
        return Cache::get("stats:monthly:{$tenantId}:{$year}:{$month}");
    }

    public function setMonthlyStats(string $tenantId, int $year, int $month, array $data): void
    {
        Cache::put(
            "stats:monthly:{$tenantId}:{$year}:{$month}",
            $data,
            self::TTL_STATS
        );
    }

    public function invalidateStats(string $tenantId): void
    {
        // タグベースキャッシュクリア（Redis SCAN を使用）
        $pattern = "stats:*:{$tenantId}:*";
        $this->forgetByPattern($pattern);
    }

    public function getUserPermissions(string $userId): ?array
    {
        return Cache::get("user:permissions:{$userId}");
    }

    public function setUserPermissions(string $userId, array $permissions): void
    {
        Cache::put("user:permissions:{$userId}", $permissions, self::TTL_USER);
    }

    public function invalidateUserPermissions(string $userId): void
    {
        Cache::forget("user:permissions:{$userId}");
    }

    private function forgetByPattern(string $pattern): void
    {
        if (config('cache.default') !== 'redis') {
            return;
        }

        $redis  = Cache::getRedis();
        $keys   = $redis->keys(config('cache.prefix') . ':' . $pattern);
        if (!empty($keys)) {
            $redis->del($keys);
        }
    }
}
