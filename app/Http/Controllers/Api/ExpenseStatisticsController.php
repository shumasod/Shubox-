<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseStatisticsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $userId   = Auth::id();
        $scope    = $request->input('scope', 'tenant'); // tenant | personal

        $base = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->when($scope === 'personal', fn($q) => $q->where('user_id', $userId))
            ->whereIn('status', ['pending', 'approved']);

        $now = now();

        // MTD
        $mtd = (clone $base)
            ->whereYear('expense_date', $now->year)
            ->whereMonth('expense_date', $now->month)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->first();

        // YTD
        $ytd = (clone $base)
            ->whereYear('expense_date', $now->year)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->first();

        // This week (Mon–Sun)
        $weekStart = $now->copy()->startOfWeek()->toDateString();
        $week = (clone $base)
            ->where('expense_date', '>=', $weekStart)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->first();

        // Last 7 days daily breakdown
        $daily = (clone $base)
            ->where('expense_date', '>=', $now->copy()->subDays(6)->toDateString())
            ->selectRaw("expense_date, COUNT(*) as count, COALESCE(SUM(amount), 0) as total")
            ->groupBy('expense_date')
            ->orderBy('expense_date')
            ->get()
            ->keyBy('expense_date')
            ->map(fn($r) => ['count' => (int) $r->count, 'total' => (float) $r->total]);

        // Fill in missing days with zeros
        $dailyFilled = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = $now->copy()->subDays($i)->toDateString();
            $dailyFilled[$d] = $daily[$d] ?? ['count' => 0, 'total' => 0.0];
        }

        // Pending count and total
        $pending = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->when($scope === 'personal', fn($q) => $q->where('user_id', $userId))
            ->where('status', 'pending')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->first();

        // Average approval time (hours) for approved expenses in last 30 days
        $avgApprovalHours = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->where('status', 'approved')
            ->whereNotNull('approved_at')
            ->where('approved_at', '>=', $now->copy()->subDays(30))
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) as avg_hours')
            ->value('avg_hours');

        return response()->json([
            'scope'              => $scope,
            'mtd'                => ['count' => (int) $mtd->count, 'total' => (float) $mtd->total],
            'ytd'                => ['count' => (int) $ytd->count, 'total' => (float) $ytd->total],
            'this_week'          => ['count' => (int) $week->count, 'total' => (float) $week->total],
            'daily_last_7'       => $dailyFilled,
            'pending'            => ['count' => (int) $pending->count, 'total' => (float) $pending->total],
            'avg_approval_hours' => $avgApprovalHours ? round((float) $avgApprovalHours, 1) : null,
        ]);
    }
}
