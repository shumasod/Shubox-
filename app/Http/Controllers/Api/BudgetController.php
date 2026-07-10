<?php

namespace App\Http\Controllers\Api;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $budgets = Budget::forTenant($tenantId)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->boolean('current'), fn($q) => $q->currentPeriod())
            ->withCount([])
            ->orderBy('start_date', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $budgets->items(),
            'meta' => [
                'current_page' => $budgets->currentPage(),
                'last_page'    => $budgets->lastPage(),
                'total'        => $budgets->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'type'            => 'required|in:department,project,category',
            'owner_id'        => 'nullable|integer',
            'owner_type'      => 'nullable|string|max:50',
            'amount'          => 'required|numeric|min:1|max:999999999.99',
            'currency'        => 'required|string|size:3',
            'period'          => 'required|in:monthly,quarterly,annual',
            'start_date'      => 'required|date',
            'end_date'        => 'required|date|after:start_date',
            'alert_threshold' => 'nullable|integer|min:1|max:100',
        ]);

        $budget = Budget::create(array_merge($validated, [
            'tenant_id' => Auth::user()->tenant_id,
        ]));

        return response()->json($budget, 201);
    }

    public function show(int $id): JsonResponse
    {
        $budget = Budget::forTenant(Auth::user()->tenant_id)->findOrFail($id);
        return response()->json($budget);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $budget = Budget::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:100',
            'amount'          => 'sometimes|numeric|min:1|max:999999999.99',
            'end_date'        => 'sometimes|date|after:start_date',
            'alert_threshold' => 'sometimes|integer|min:1|max:100',
            'status'          => 'sometimes|in:active,inactive',
        ]);

        $budget->update($validated);

        return response()->json($budget);
    }

    public function destroy(int $id): JsonResponse
    {
        $budget = Budget::forTenant(Auth::user()->tenant_id)->findOrFail($id);
        $budget->delete();
        return response()->json(null, 204);
    }

    public function summary(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $summary = Budget::forTenant($tenantId)
            ->currentPeriod()
            ->active()
            ->select([
                DB::raw('COUNT(*) as total_budgets'),
                DB::raw('SUM(amount) as total_allocated'),
                DB::raw('SUM(spent_amount) as total_spent'),
                DB::raw('COUNT(CASE WHEN spent_amount > amount THEN 1 END) as exceeded_count'),
                DB::raw('COUNT(CASE WHEN (spent_amount / amount * 100) >= alert_threshold THEN 1 END) as alert_count'),
            ])
            ->first();

        return response()->json([
            'total_budgets'   => (int) $summary->total_budgets,
            'total_allocated' => (float) $summary->total_allocated,
            'total_spent'     => (float) $summary->total_spent,
            'total_remaining' => max(0, $summary->total_allocated - $summary->total_spent),
            'utilization_pct' => $summary->total_allocated > 0
                ? round($summary->total_spent / $summary->total_allocated * 100, 2)
                : 0,
            'exceeded_count'  => (int) $summary->exceeded_count,
            'alert_count'     => (int) $summary->alert_count,
        ]);
    }
}
