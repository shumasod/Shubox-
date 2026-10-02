<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $tenantId  = Auth::user()->tenant_id;
        $userId    = Auth::id();
        $isAdmin   = Auth::user()->role === 'admin';
        $year      = (int) ($request->year ?? now()->year);
        $month     = (int) ($request->month ?? now()->month);

        $base = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at');

        if (!$isAdmin) {
            $base = $base->where('applicant_id', $userId);
        }

        // Current period
        $current = (clone $base)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        // Previous period (same month last year for YoY)
        $prev = (clone $base)
            ->whereYear('created_at', $year - 1)
            ->whereMonth('created_at', $month);

        $currentStats = $this->aggregate($current);
        $prevStats    = $this->aggregate($prev);

        // Pending approvals for this user (as approver)
        $pendingApprovals = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['submitted', 'pending_approval'])
            ->count();

        // Top 5 categories this month
        $topCategories = DB::table('expenses')
            ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->where('expenses.tenant_id', $tenantId)
            ->whereNull('expenses.deleted_at')
            ->whereYear('expenses.created_at', $year)
            ->whereMonth('expenses.created_at', $month)
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->select('expense_categories.name', DB::raw('SUM(total_amount) as total'))
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'period' => ['year' => $year, 'month' => $month],
                'current' => $currentStats,
                'previous_year' => $prevStats,
                'trend' => $this->trend($currentStats, $prevStats),
                'pending_approvals' => $pendingApprovals,
                'top_categories' => $topCategories,
            ],
        ]);
    }

    private function aggregate($query): array
    {
        $rows = (clone $query)->select([
            DB::raw('COUNT(*) as count'),
            DB::raw('COALESCE(SUM(total_amount), 0) as total'),
            DB::raw('COALESCE(AVG(total_amount), 0) as avg'),
            DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved'),
            DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected'),
            DB::raw('SUM(CASE WHEN status IN ("submitted","pending_approval") THEN 1 ELSE 0 END) as pending'),
        ])->first();

        return [
            'count'    => (int) $rows->count,
            'total'    => (int) $rows->total,
            'average'  => (int) $rows->avg,
            'approved' => (int) $rows->approved,
            'rejected' => (int) $rows->rejected,
            'pending'  => (int) $rows->pending,
        ];
    }

    private function trend(array $current, array $prev): array
    {
        $change = fn(int $c, int $p): float =>
            $p > 0 ? round(($c - $p) / $p * 100, 1) : ($c > 0 ? 100.0 : 0.0);

        return [
            'total_change_pct'   => $change($current['total'],   $prev['total']),
            'count_change_pct'   => $change($current['count'],   $prev['count']),
            'average_change_pct' => $change($current['average'], $prev['average']),
        ];
    }
}
