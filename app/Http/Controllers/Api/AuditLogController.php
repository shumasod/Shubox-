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
        $request->validate([
            'auditable_type' => 'nullable|string|max:128',
            'auditable_id'   => 'nullable|integer|min:1',
            'event'          => 'nullable|string|max:64',
            'user_id'        => 'nullable|integer|min:1',
            'date_from'      => 'nullable|date',
            'date_to'        => 'nullable|date|after_or_equal:date_from',
            'per_page'       => 'nullable|integer|min:1|max:100',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $query = AuditLog::forTenant($tenantId)
            ->with('user:id,name,email')
            ->latest('created_at');

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', $request->auditable_type);
        }
        if ($request->filled('auditable_id')) {
            $query->where('auditable_id', $request->integer('auditable_id'));
        }
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->integer('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $log = AuditLog::forTenant(Auth::user()->tenant_id)
            ->with('user:id,name,email')
            ->findOrFail($id);

        return response()->json($log);
    }

    public function forResource(Request $request, string $type, int $resourceId): JsonResponse
    {
        $logs = AuditLog::forTenant(Auth::user()->tenant_id)
            ->forModel($type, $resourceId)
            ->with('user:id,name,email')
            ->latest('created_at')
            ->paginate(50);

        return response()->json($logs);
    }
}
