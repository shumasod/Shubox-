<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'budget_type' => 'nullable|in:department,project,category,user',
            'active_only' => 'boolean',
            'period'      => 'nullable|in:current,upcoming,past',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $query    = Budget::where('tenant_id', $tenantId)->orderBy('name');

        if ($request->filled('budget_type')) {
            $query->where('budget_type', $request->input('budget_type'));
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        if ($request->filled('period')) {
            $today = now()->toDateString();
            match ($request->input('period')) {
                'current'  => $query->where('period_start', '<=', $today)->where('period_end', '>=', $today),
                'upcoming' => $query->where('period_start', '>', $today),
                'past'     => $query->where('period_end', '<', $today),
            };
        }

        $budgets = $query->paginate(20);
        $ids     = collect($budgets->items())->pluck('id');

        // Batch-load utilization
        $utilization = $this->batchUtilization($ids->all(), $tenantId);

        $items = collect($budgets->items())->map(function ($b) use ($utilization) {
            $spent = $utilization[$b->id] ?? 0;
            return array_merge($b->toArray(), [
                'spent_amount'    => $spent,
                'utilization_pct' => $b->amount > 0 ? round($spent / $b->amount * 100, 1) : 0,
                'is_over_budget'  => $spent > $b->amount,
                'is_near_alert'   => $b->amount > 0 && ($spent / $b->amount * 100) >= $b->alert_threshold,
            ]);
        });

        return response()->json([
            'data' => $items,
            'meta' => ['current_page' => $budgets->currentPage(), 'last_page' => $budgets->lastPage(), 'total' => $budgets->total()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'name'            => 'required|string|max:120',
            'budget_type'     => 'required|in:department,project,category,user',
            'target_id'       => 'nullable|integer|min:1',
            'period_type'     => 'required|in:monthly,quarterly,annual,custom',
            'period_start'    => 'required|date',
            'period_end'      => 'required|date|after_or_equal:period_start',
            'amount'          => 'required|integer|min:1',
            'currency'        => 'required|string|size:3',
            'alert_threshold' => 'integer|min:10|max:100',
        ]);

        $budget = Budget::create(array_merge($validated, ['tenant_id' => $tenantId]));

        return response()->json(['data' => $budget], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $budget   = Budget::where('tenant_id', $tenantId)->findOrFail($id);
        $spent    = $this->batchUtilization([$id], $tenantId)[$id] ?? 0;

        return response()->json(['data' => array_merge($budget->toArray(), [
            'spent_amount'    => $spent,
            'utilization_pct' => $budget->amount > 0 ? round($spent / $budget->amount * 100, 1) : 0,
        ])]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $budget = Budget::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:120',
            'period_start'    => 'sometimes|date',
            'period_end'      => 'sometimes|date|after_or_equal:period_start',
            'amount'          => 'sometimes|integer|min:1',
            'alert_threshold' => 'sometimes|integer|min:10|max:100',
            'is_active'       => 'sometimes|boolean',
        ]);

        $budget->update($validated);

        return response()->json(['data' => $budget->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Budget::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    private function batchUtilization(array $budgetIds, int $tenantId): array
    {
        if (empty($budgetIds)) return [];

        // This join assumes expenses have budget_id; adjust if budget type mapping differs
        $rows = DB::table('expenses')
            ->whereIn('budget_id', $budgetIds)
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'submitted'])
            ->whereNull('deleted_at')
            ->groupBy('budget_id')
            ->select('budget_id', DB::raw('SUM(amount) as total'))
            ->pluck('total', 'budget_id')
            ->all();

        return array_map('intval', $rows);
    }
}
