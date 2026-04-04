<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Infrastructure\Persistence\Eloquent\Models\AuditLogModel;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    private const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (
            in_array($request->method(), self::AUDITED_METHODS, true)
            && auth()->check()
            && $response->getStatusCode() < 400
        ) {
            $user = auth()->user();
            $tenantId = $user->tenant_id ?? null;

            if ($tenantId) {
                AuditLogModel::create([
                    'id' => Str::uuid()->toString(),
                    'tenant_id' => $tenantId,
                    'user_id' => $user->id,
                    'event_type' => $this->resolveEventType($request),
                    'resource_type' => $this->resolveResourceType($request),
                    'resource_id' => $this->resolveResourceId($request),
                    'new_values' => $this->sanitizePayload($request->all()),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
        }

        return $response;
    }

    private function resolveEventType(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        return match (true) {
            str_contains($path, 'approve') => 'expense.approved',
            str_contains($path, 'reject') => 'expense.rejected',
            str_contains($path, 'submit') => 'expense.submitted',
            str_contains($path, 'cancel') => 'expense.cancelled',
            $method === 'POST' => 'resource.created',
            $method === 'PUT' || $method === 'PATCH' => 'resource.updated',
            $method === 'DELETE' => 'resource.deleted',
            default => 'resource.modified',
        };
    }

    private function resolveResourceType(Request $request): string
    {
        $segments = explode('/', $request->path());
        return $segments[2] ?? 'unknown'; // api/v1/{resource}/...
    }

    private function resolveResourceId(Request $request): ?string
    {
        $segments = explode('/', $request->path());
        // api/v1/expenses/{id} → インデックス3
        return $segments[3] ?? null;
    }

    private function sanitizePayload(array $data): array
    {
        $sensitive = ['password', 'password_confirmation', 'token', 'secret'];
        foreach ($sensitive as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***';
            }
        }
        return $data;
    }
}
