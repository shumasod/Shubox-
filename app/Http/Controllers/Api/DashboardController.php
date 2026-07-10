<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function kpi(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $now      = now();

        $base = fn () => Expense::where('tenant_id', $tenantId);

        $totalMtd = (clone $base())
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('amount');

        $totalYtd = (clone $base())
            ->whereYear('created_at', $now->year)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('amount');

        $pendingStats = (clone $base())
            ->where('status', 'pending')
            ->selectRaw('COUNT(*) as cnt, SUM(amount) as total')
            ->first();

        $approvedCount = (clone $base())->whereIn('status', ['approved', 'paid'])->count();
        $rejectedCount = (clone $base())->where('status', 'rejected')->count();
        $submittedCount = (clone $base())->whereNotIn('status', ['draft'])->count();

        $rejectionRate = $submittedCount > 0
            ? round(($rejectedCount / $submittedCount) * 100, 2)
            : 0.0;

        $avgApprovalDays = (clone $base())
            ->whereNotNull('approved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(DAY, created_at, approved_at)) as avg_days')
            ->value('avg_days') ?? 0.0;

        return response()->json([
            'total_spend_mtd'   => (int) $totalMtd,
            'total_spend_ytd'   => (int) $totalYtd,
            'pending_count'     => (int) ($pendingStats->cnt ?? 0),
            'pending_amount'    => (int) ($pendingStats->total ?? 0),
            'approved_count'    => $approvedCount,
            'rejected_count'    => $rejectedCount,
            'rejection_rate'    => (float) $rejectionRate,
            'avg_approval_days' => round((float) $avgApprovalDays, 1),
            'currency'          => 'JPY',
        ]);
    }
}
