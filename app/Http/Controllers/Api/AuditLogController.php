<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Traits\HasCursorPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use HasCursorPagination;

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'action'         => 'nullable|string|max:100',
            'auditable_type' => 'nullable|string|max:100',
            'auditable_id'   => 'nullable|integer',
            'user_id'        => 'nullable|integer',
            'from'           => 'nullable|date_format:Y-m-d',
            'to'             => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'limit'          => 'nullable|integer|min:1|max:100',
            'cursor'         => 'nullable|string',
        ]);

        $query = AuditLog::with('user:id,name,email')
            ->forTenant($request->user()->tenant_id)
            ->when($request->action,         fn ($q) => $q->where('action', $request->action))
            ->when($request->auditable_type,  fn ($q) => $q->where('auditable_type', $request->auditable_type))
            ->when($request->auditable_id,    fn ($q) => $q->where('auditable_id', $request->auditable_id))
            ->when($request->user_id,         fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->from,            fn ($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->to,              fn ($q) => $q->whereDate('created_at', '<=', $request->to));

        $paginated = $this->paginateWithCursor($query, $request, 50, 'created_at');

        return response()->json([
            'data'        => $paginated['data'],
            'next_cursor' => $paginated['next_cursor'],
            'has_more'    => $paginated['has_more'],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $log = AuditLog::with('user:id,name,email')
            ->forTenant($request->user()->tenant_id)
            ->findOrFail($id);

        return response()->json(['data' => $log]);
    }
}
