<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Infrastructure\Persistence\Eloquent\Models\TenantModel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * テナントを解決してリクエストにバインドするMiddleware
 * - JWT クレームの tenant_id を使用
 * - または X-Tenant-Slug ヘッダーを使用（開発時）
 */
class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = auth()->user()?->tenant_id
            ?? $request->header('X-Tenant-Id');

        if (!$tenantId) {
            return response()->json(['message' => 'Tenant not resolved.'], 401);
        }

        $tenant = TenantModel::where('id', $tenantId)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found or inactive.'], 403);
        }

        $request->merge(['_tenant' => $tenant]);
        app()->instance('current_tenant', $tenant);

        return $next($request);
    }
}
