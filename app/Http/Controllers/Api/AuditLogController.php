<?php

namespace App\Http\Controllers\Api;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'auditable_type' => 'nullable|string|in:expense,approval,user,vendor,project',
            'auditable_id'   => 'nullable|integer',
            'event'          => 'nullable|string',
            'user_id'        => 'nullable|integer',
            'from'           => 'nullable|date',
            'to'             => 'nullable|date|after_or_equal:from',
            'per_page'       => 'nullable|integer|min:1|max:100',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $typeMap = [
            'expense'  => 'App\\Models\\Expense',
            'approval' => 'App\\Models\\Approval',
            'user'     => 'App\\Models\\User',
            'vendor'   => 'App\\Models\\Vendor',
            'project'  => 'App\\Models\\Project',
        ];

        $query = AuditLog::with('user:id,name,email')
            ->where('tenant_id', $tenantId)
            ->when(
                isset($validated['auditable_type']),
                fn ($q) => $q->where('auditable_type', $typeMap[$validated['auditable_type']])
            )
            ->when(
                isset($validated['auditable_id']),
                fn ($q) => $q->where('auditable_id', $validated['auditable_id'])
            )
            ->when(
                isset($validated['event']),
                fn ($q) => $q->where('event', $validated['event'])
            )
            ->when(
                isset($validated['user_id']),
                fn ($q) => $q->where('user_id', $validated['user_id'])
            )
            ->when(
                isset($validated['from']),
                fn ($q) => $q->whereDate('created_at', '>=', $validated['from'])
            )
            ->when(
                isset($validated['to']),
                fn ($q) => $q->whereDate('created_at', '<=', $validated['to'])
            )
            ->orderByDesc('created_at');

        $perPage = $validated['per_page'] ?? 50;

        return response()->json($query->paginate($perPage));
    }

    public function show(int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $log = AuditLog::with('user:id,name,email')
            ->where('tenant_id', $tenantId)
            ->findOrFail($id);

        return response()->json($log);
    }

    public function forResource(Request $request, string $type, int $id): JsonResponse
    {
        $typeMap = [
            'expenses'  => 'App\\Models\\Expense',
            'approvals' => 'App\\Models\\Approval',
            'users'     => 'App\\Models\\User',
            'vendors'   => 'App\\Models\\Vendor',
            'projects'  => 'App\\Models\\Project',
        ];

        if (! isset($typeMap[$type])) {
            return response()->json(['message' => 'Invalid resource type.'], 422);
        }

        $tenantId = Auth::user()->tenant_id;

        $logs = AuditLog::with('user:id,name,email')
            ->where('tenant_id', $tenantId)
            ->where('auditable_type', $typeMap[$type])
            ->where('auditable_id', $id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($logs);
    }
}
