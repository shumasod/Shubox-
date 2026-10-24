<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $budgets = Budget::where('tenant_id', Auth::user()->tenant_id)
            ->when($request->fiscal_year, fn($q, $y) => $q->where('fiscal_year', $y))
            ->when($request->department_id, fn($q, $d) => $q->where('department_id', $d))
            ->orderByDesc('fiscal_year')
            ->get()
            ->map(fn($b) => $this->format($b));

        return response()->json(['data' => $budgets]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fiscal_year'   => 'required|integer|min:2000|max:2100',
            'department_id' => 'nullable|exists:departments,id',
            'category_id'   => 'nullable|exists:expense_categories,id',
            'amount'        => 'required|integer|min:1',
            'note'          => 'nullable|string|max:500',
        ]);

        $budget = Budget::create(array_merge($data, [
            'tenant_id' => Auth::user()->tenant_id,
            'spent'     => 0,
        ]));

        return response()->json(['data' => $this->format($budget)], 201);
    }

    public function show(int $id): JsonResponse
    {
        $budget = Budget::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        return response()->json(['data' => $this->format($budget)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $budget = Budget::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'amount' => 'sometimes|required|integer|min:1',
            'note'   => 'nullable|string|max:500',
        ]);

        $budget->update($data);
        return response()->json(['data' => $this->format($budget->fresh())]);
    }

    public function destroy(int $id): JsonResponse
    {
        $budget = Budget::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $budget->delete();
        return response()->json(null, 204);
    }

    private function format(Budget $b): array
    {
        return [
            'id'            => $b->id,
            'fiscal_year'   => $b->fiscal_year,
            'department_id' => $b->department_id,
            'category_id'   => $b->category_id,
            'amount'        => $b->amount,
            'spent'         => $b->spent,
            'remaining'     => max(0, $b->amount - $b->spent),
            'usage_rate'    => $b->amount > 0 ? round($b->spent / $b->amount * 100, 1) : 0,
            'note'          => $b->note,
            'created_at'    => $b->created_at->toIso8601String(),
        ];
    }
}
