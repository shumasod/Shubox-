<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseItemModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * 月次サマリー（月ごとの合計金額・件数・ステータス内訳）
     */
    public function monthly(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $year     = (int) $request->query('year',  now()->year);
        $months   = collect(range(1, 12))->map(function (int $month) use ($tenantId, $year) {
            $data = ExpenseModel::where('tenant_id', $tenantId)
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            return [
                'month'             => $month,
                'year'              => $year,
                'total_amount'      => $data->sum('total'),
                'total_count'       => $data->sum('count'),
                'by_status'         => $data->map(fn($r) => [
                    'count'  => $r->count,
                    'amount' => $r->total,
                ]),
            ];
        });

        return response()->json(['data' => $months, 'year' => $year]);
    }

    /**
     * カテゴリ別集計
     */
    public function byCategory(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $from     = $request->query('from', now()->startOfMonth()->toDateString());
        $to       = $request->query('to',   now()->toDateString());

        $rows = ExpenseItemModel::join('expenses', 'expense_items.expense_id', '=', 'expenses.id')
            ->join('categories', 'expense_items.category_id', '=', 'categories.id')
            ->where('expenses.tenant_id', $tenantId)
            ->whereIn('expenses.status', ['approved', 'paid'])
            ->whereBetween('expense_items.expense_date', [$from, $to])
            ->selectRaw('
                categories.id,
                categories.name,
                categories.code,
                COUNT(DISTINCT expenses.id)    AS expense_count,
                SUM(expense_items.amount * expense_items.quantity) AS total_amount
            ')
            ->groupBy('categories.id', 'categories.name', 'categories.code')
            ->orderByDesc('total_amount')
            ->get();

        return response()->json([
            'data'  => $rows,
            'from'  => $from,
            'to'    => $to,
            'total' => $rows->sum('total_amount'),
        ]);
    }

    /**
     * 申請者別集計
     */
    public function byApplicant(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $from     = $request->query('from', now()->startOfMonth()->toDateString());
        $to       = $request->query('to',   now()->toDateString());

        $rows = ExpenseModel::join('users', 'expenses.applicant_id', '=', 'users.id')
            ->where('expenses.tenant_id', $tenantId)
            ->whereIn('expenses.status', ['approved', 'paid'])
            ->whereBetween(DB::raw('DATE(expenses.created_at)'), [$from, $to])
            ->selectRaw('
                users.id,
                users.name,
                users.department,
                COUNT(*)            AS expense_count,
                SUM(total_amount)   AS total_amount
            ')
            ->groupBy('users.id', 'users.name', 'users.department')
            ->orderByDesc('total_amount')
            ->limit(50)
            ->get();

        return response()->json([
            'data'  => $rows,
            'from'  => $from,
            'to'    => $to,
        ]);
    }

    /**
     * 承認所要時間の統計
     */
    public function approvalStats(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $from     = $request->query('from', now()->subMonths(3)->toDateString());
        $to       = $request->query('to',   now()->toDateString());

        $stats = ExpenseModel::where('tenant_id', $tenantId)
            ->where('status', 'approved')
            ->whereNotNull('applied_at')
            ->whereBetween(DB::raw('DATE(approved_at)'), [$from, $to])
            ->selectRaw('
                AVG(TIMESTAMPDIFF(HOUR, applied_at, approved_at))   AS avg_hours,
                MIN(TIMESTAMPDIFF(HOUR, applied_at, approved_at))   AS min_hours,
                MAX(TIMESTAMPDIFF(HOUR, applied_at, approved_at))   AS max_hours,
                COUNT(*)                                             AS approved_count
            ')
            ->first();

        return response()->json([
            'data' => [
                'avg_hours'      => round($stats->avg_hours ?? 0, 1),
                'min_hours'      => $stats->min_hours ?? 0,
                'max_hours'      => $stats->max_hours ?? 0,
                'approved_count' => $stats->approved_count ?? 0,
            ],
            'from' => $from,
            'to'   => $to,
        ]);
    }
}
