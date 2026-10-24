<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseTagDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseTagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = ExpenseTagDefinition::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $tags]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:50',
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $tag = ExpenseTagDefinition::firstOrCreate(
            ['tenant_id' => $request->user()->tenant_id, 'name' => $data['name']],
            ['color' => $data['color'] ?? '#6366f1']
        );

        return response()->json(['data' => $tag], $tag->wasRecentlyCreated ? 201 : 200);
    }

    public function syncExpenseTags(Request $request, int $expenseId): JsonResponse
    {
        $expense = Expense::where('tenant_id', $request->user()->tenant_id)->findOrFail($expenseId);

        $data = $request->validate(['tag_ids' => 'required|array', 'tag_ids.*' => 'integer']);

        // Verify all tag IDs belong to this tenant
        $validIds = ExpenseTagDefinition::where('tenant_id', $request->user()->tenant_id)
            ->whereIn('id', $data['tag_ids'])
            ->pluck('id');

        $expense->tags()->sync($validIds);

        return response()->json(['data' => $expense->tags()->orderBy('name')->get()]);
    }
}
