<?php

namespace App\Http\Controllers\Api;

use App\Models\RecurringExpense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RecurringExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $recurring = RecurringExpense::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->with('category:id,name,color')
            ->orderBy('next_run_date')
            ->paginate(20);

        return response()->json($recurring);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:200',
            'description'      => 'nullable|string|max:1000',
            'amount'           => 'required|numeric|min:0.01|max:9999999.99',
            'currency'         => 'required|string|size:3',
            'category_id'      => 'nullable|integer|exists:expense_categories,id',
            'frequency'        => 'required|in:daily,weekly,monthly,quarterly,annual',
            'interval'         => 'nullable|integer|min:1|max:12',
            'next_run_date'    => 'required|date|after_or_equal:today',
            'end_date'         => 'nullable|date|after:next_run_date',
            'max_occurrences'  => 'nullable|integer|min:1|max:999',
        ]);

        $recurring = RecurringExpense::create(array_merge($validated, [
            'tenant_id' => Auth::user()->tenant_id,
            'user_id'   => Auth::id(),
            'interval'  => $validated['interval'] ?? 1,
        ]));

        return response()->json($recurring, 201);
    }

    public function show(int $id): JsonResponse
    {
        $recurring = RecurringExpense::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->with('category')
            ->findOrFail($id);

        return response()->json($recurring);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $recurring = RecurringExpense::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $validated = $request->validate([
            'title'           => 'sometimes|string|max:200',
            'description'     => 'sometimes|nullable|string|max:1000',
            'amount'          => 'sometimes|numeric|min:0.01|max:9999999.99',
            'end_date'        => 'sometimes|nullable|date',
            'max_occurrences' => 'sometimes|nullable|integer|min:1',
            'status'          => 'sometimes|in:active,paused,cancelled',
        ]);

        $recurring->update($validated);

        return response()->json($recurring);
    }

    public function destroy(int $id): JsonResponse
    {
        $recurring = RecurringExpense::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $recurring->update(['status' => 'cancelled']);
        $recurring->delete();

        return response()->json(null, 204);
    }
}
