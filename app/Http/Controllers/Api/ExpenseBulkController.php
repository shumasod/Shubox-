<?php

namespace App\Http\Controllers\Api;

use App\Jobs\ExportExpensesCsv;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseBulkController extends Controller
{
    private const ALLOWED_ACTIONS = ['approve', 'reject', 'export', 'delete'];
    private const MAX_IDS = 500;

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action'          => 'required|in:approve,reject,export,delete',
            'ids'             => 'required|array|min:1|max:' . self::MAX_IDS,
            'ids.*'           => 'integer|min:1',
            'rejection_reason'=> 'nullable|string|max:500',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $action   = $validated['action'];
        $ids      = array_unique($validated['ids']);

        // Verify all IDs belong to the current tenant
        $count = Expense::where('tenant_id', $tenantId)
            ->whereIn('id', $ids)
            ->count();

        if ($count !== count($ids)) {
            return response()->json(['message' => 'One or more expense IDs are invalid.'], 422);
        }

        return match ($action) {
            'approve' => $this->bulkApprove($ids, $tenantId),
            'reject'  => $this->bulkReject($ids, $tenantId, $validated['rejection_reason'] ?? null),
            'export'  => $this->bulkExport($ids, $tenantId),
            'delete'  => $this->bulkDelete($ids, $tenantId),
        };
    }

    private function bulkApprove(array $ids, int $tenantId): JsonResponse
    {
        $updated = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $ids)
            ->where('status', 'pending')
            ->update([
                'status'      => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'updated_at'  => now(),
            ]);

        return response()->json([
            'action'  => 'approve',
            'updated' => $updated,
            'skipped' => count($ids) - $updated,
        ]);
    }

    private function bulkReject(array $ids, int $tenantId, ?string $reason): JsonResponse
    {
        $updated = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $ids)
            ->where('status', 'pending')
            ->update([
                'status'           => 'rejected',
                'rejection_reason' => $reason,
                'updated_at'       => now(),
            ]);

        return response()->json([
            'action'  => 'reject',
            'updated' => $updated,
            'skipped' => count($ids) - $updated,
        ]);
    }

    private function bulkExport(array $ids, int $tenantId): JsonResponse
    {
        ExportExpensesCsv::dispatch(
            Auth::user(),
            ['ids' => $ids, 'tenant_id' => $tenantId]
        )->onQueue('reports');

        return response()->json([
            'action'  => 'export',
            'queued'  => count($ids),
            'message' => 'Export queued. You will receive a download link by email.',
        ], 202);
    }

    private function bulkDelete(array $ids, int $tenantId): JsonResponse
    {
        $deleted = Expense::where('tenant_id', $tenantId)
            ->whereIn('id', $ids)
            ->whereIn('status', ['pending', 'rejected'])
            ->delete();

        return response()->json([
            'action'  => 'delete',
            'deleted' => $deleted,
            'skipped' => count($ids) - $deleted,
        ]);
    }
}
