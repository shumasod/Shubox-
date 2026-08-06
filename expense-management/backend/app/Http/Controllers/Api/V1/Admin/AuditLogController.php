<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\AuditLogModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'user_id'      => ['nullable', 'uuid'],
            'action'       => ['nullable', 'in:create,update,delete,login,logout,export'],
            'resource_type'=> ['nullable', 'string', 'max:50'],
            'resource_id'  => ['nullable', 'uuid'],
            'from'         => ['nullable', 'date'],
            'to'           => ['nullable', 'date'],
            'per_page'     => ['integer', 'min:1', 'max:100'],
        ]);

        $query = AuditLogModel::with('user')
            ->where('tenant_id', $tenantId)
            ->orderByDesc('created_at');

        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }
        if (!empty($validated['action'])) {
            $query->where('action', $validated['action']);
        }
        if (!empty($validated['resource_type'])) {
            $query->where('resource_type', $validated['resource_type']);
        }
        if (!empty($validated['resource_id'])) {
            $query->where('resource_id', $validated['resource_id']);
        }
        if (!empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }
        if (!empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $logs = $query->paginate((int) ($validated['per_page'] ?? 50));

        return response()->json([
            'data' => $logs->map(fn($log) => [
                'id'            => $log->id,
                'action'        => $log->action,
                'resource_type' => $log->resource_type,
                'resource_id'   => $log->resource_id,
                'changes'       => $log->changes,
                'ip_address'    => $log->ip_address,
                'user_agent'    => $log->user_agent,
                'user'          => $log->user ? [
                    'id'   => $log->user->id,
                    'name' => $log->user->name,
                ] : null,
                'created_at'    => $log->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $log      = AuditLogModel::with('user')
            ->where('tenant_id', $tenantId)
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id'            => $log->id,
                'action'        => $log->action,
                'resource_type' => $log->resource_type,
                'resource_id'   => $log->resource_id,
                'old_values'    => $log->old_values,
                'new_values'    => $log->new_values,
                'changes'       => $log->changes,
                'ip_address'    => $log->ip_address,
                'user_agent'    => $log->user_agent,
                'user'          => $log->user ? [
                    'id'         => $log->user->id,
                    'name'       => $log->user->name,
                    'department' => $log->user->department,
                ] : null,
                'created_at'    => $log->created_at->toIso8601String(),
            ],
        ]);
    }
}
