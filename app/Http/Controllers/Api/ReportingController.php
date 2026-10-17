<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReportingController extends Controller
{
    public function monthly(Request $request): JsonResponse
    {
        $request->validate([
            'year'        => 'required|integer|min:2000|max:2100',
            'category_id' => 'nullable|integer|exists:expense_categories,id',
            'user_id'     => 'nullable|integer|exists:users,id',
        ]);

        $tenantId   = Auth::user()->tenant_id;
        $year       = (int) $request->year;
        $categoryId = $request->category_id;
        $userId     = $request->user_id;

        $rows = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('expense_date', $year)
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->selectRaw('MONTH(expense_date) as month, COUNT(*) as count, SUM(amount) as total, AVG(amount) as average')
            ->groupBy(DB::raw('MONTH(expense_date)'))
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $row = $rows->get($m);
            $months[] = [
                'month'   => $m,
                'count'   => $row ? (int) $row->count : 0,
                'total'   => $row ? round((float) $row->total, 2) : 0,
                'average' => $row ? round((float) $row->average, 2) : 0,
            ];
        }

        return response()->json([
            'year'   => $year,
            'months' => $months,
            'totals' => [
                'count'   => array_sum(array_column($months, 'count')),
                'total'   => array_sum(array_column($months, 'total')),
            ],
        ]);
    }

    public function quarterly(Request $request): JsonResponse
    {
        $request->validate(['year' => 'required|integer|min:2000|max:2100']);

        $tenantId = Auth::user()->tenant_id;
        $year     = (int) $request->year;

        $rows = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('expense_date', $year)
            ->selectRaw('QUARTER(expense_date) as quarter, COUNT(*) as count, SUM(amount) as total')
            ->groupBy(DB::raw('QUARTER(expense_date)'))
            ->orderBy('quarter')
            ->get()
            ->keyBy('quarter');

        $quarters = [];
        for ($q = 1; $q <= 4; $q++) {
            $row = $rows->get($q);
            $quarters[] = [
                'quarter' => $q,
                'label'   => "Q{$q}",
                'count'   => $row ? (int) $row->count : 0,
                'total'   => $row ? round((float) $row->total, 2) : 0,
            ];
        }

        return response()->json(['year' => $year, 'quarters' => $quarters]);
    }

    public function yearOverYear(Request $request): JsonResponse
    {
        $request->validate([
            'years' => 'required|array|min:1|max:5',
            'years.*' => 'integer|min:2000|max:2100',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $years    = $request->years;

        $rows = DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereIn(DB::raw('YEAR(expense_date)'), $years)
            ->selectRaw('YEAR(expense_date) as year, MONTH(expense_date) as month, SUM(amount) as total')
            ->groupBy(DB::raw('YEAR(expense_date), MONTH(expense_date)'))
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $byYear = [];
        foreach ($years as $y) {
            $byYear[$y] = array_fill(1, 12, 0);
        }
        foreach ($rows as $row) {
            $byYear[$row->year][$row->month] = round((float) $row->total, 2);
        }

        return response()->json([
            'years'  => $years,
            'series' => array_map(fn($y) => [
                'year'   => $y,
                'months' => array_values($byYear[$y]),
            ], $years),
        ]);
    }

    public function categoryBreakdown(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $rows = DB::table('expenses as e')
            ->join('expense_categories as c', 'e.category_id', '=', 'c.id')
            ->where('e.tenant_id', $tenantId)
            ->whereIn('e.status', ['approved', 'paid'])
            ->whereBetween('e.expense_date', [$request->start_date, $request->end_date])
            ->selectRaw('c.id, c.name, c.color, COUNT(e.id) as count, SUM(e.amount) as total')
            ->groupBy('c.id', 'c.name', 'c.color')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $rows->sum('total');

        $data = $rows->map(fn($r) => [
            'category_id'   => $r->id,
            'name'          => $r->name,
            'color'         => $r->color,
            'count'         => (int) $r->count,
            'total'         => round((float) $r->total, 2),
            'percentage'    => $grandTotal > 0 ? round($r->total / $grandTotal * 100, 1) : 0,
        ]);

        return response()->json([
            'start_date'  => $request->start_date,
            'end_date'    => $request->end_date,
            'grand_total' => round((float) $grandTotal, 2),
            'categories'  => $data,
        ]);
    }
}
