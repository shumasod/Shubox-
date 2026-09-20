<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:3m,6m,12m',
        ]);

        $tenantId  = Auth::user()->tenant_id;
        $period    = $request->input('period', '12m');
        $months    = (int) rtrim($period, 'm');
        $startDate = now()->subMonths($months)->startOfMonth()->toDateString();

        // Totals
        $totals = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->where('expense_date', '>=', $startDate)
            ->whereIn('status', ['approved', 'pending'])
            ->selectRaw('COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_amount, COALESCE(AVG(amount), 0) as avg_amount')
            ->first();

        // Category breakdown
        $categories = DB::table('expenses')
            ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->where('expenses.tenant_id', $tenantId)
            ->where('expenses.expense_date', '>=', $startDate)
            ->whereIn('expenses.status', ['approved', 'pending'])
            ->selectRaw('
                expense_categories.name as category,
                expense_categories.color,
                COUNT(*) as count,
                COALESCE(SUM(expenses.amount), 0) as amount
            ')
            ->groupBy('expense_categories.id', 'expense_categories.name', 'expense_categories.color')
            ->orderByDesc('amount')
            ->get();

        $totalCatAmount = $categories->sum('amount');
        $categoriesWithPct = $categories->map(fn($c) => [
            'category' => $c->category,
            'color'    => $c->color ?? '#6b7280',
            'count'    => (int) $c->count,
            'amount'   => (float) $c->amount,
            'pct'      => $totalCatAmount > 0
                ? round($c->amount / $totalCatAmount * 100, 2)
                : 0,
        ]);

        // Monthly trends
        $monthlyTrends = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->where('expense_date', '>=', $startDate)
            ->selectRaw("
                DATE_FORMAT(expense_date, '%Y-%m') as month,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as approved,
                COALESCE(SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END), 0) as rejected,
                COALESCE(SUM(CASE WHEN status = 'pending'  THEN amount ELSE 0 END), 0) as pending
            ")
            ->groupByRaw("DATE_FORMAT(expense_date, '%Y-%m')")
            ->orderBy('month')
            ->get()
            ->map(fn($r) => [
                'month'    => $r->month,
                'approved' => (float) $r->approved,
                'rejected' => (float) $r->rejected,
                'pending'  => (float) $r->pending,
            ]);

        // Top vendors
        $topVendors = DB::table('expenses')
            ->join('vendors', 'expenses.vendor_id', '=', 'vendors.id')
            ->where('expenses.tenant_id', $tenantId)
            ->where('expenses.expense_date', '>=', $startDate)
            ->whereIn('expenses.status', ['approved', 'pending'])
            ->selectRaw('vendors.name, COALESCE(SUM(expenses.amount), 0) as amount')
            ->groupBy('vendors.id', 'vendors.name')
            ->orderByDesc('amount')
            ->limit(10)
            ->get()
            ->map(fn($r) => ['name' => $r->name, 'amount' => (float) $r->amount]);

        return response()->json([
            'total_amount'    => (float) $totals->total_amount,
            'total_count'     => (int)   $totals->total_count,
            'avg_amount'      => round((float) $totals->avg_amount, 2),
            'categories'      => $categoriesWithPct,
            'monthly_trends'  => $monthlyTrends,
            'top_vendors'     => $topVendors,
            'period'          => $period,
            'start_date'      => $startDate,
        ]);
    }
}
