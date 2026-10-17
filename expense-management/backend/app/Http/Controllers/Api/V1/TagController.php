<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    public function index(): JsonResponse
    {
        $tags = ExpenseTag::where('tenant_id', Auth::user()->tenant_id)
            ->withCount('expenses')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'name'           => $t->name,
                'color'          => $t->color,
                'expenses_count' => $t->expenses_count,
            ]);

        return response()->json(['data' => $tags]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:50',
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $tag = ExpenseTag::firstOrCreate(
            ['tenant_id' => Auth::user()->tenant_id, 'name' => $data['name']],
            ['color' => $data['color'] ?? '#6366f1']
        );

        return response()->json(['data' => $tag], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tag = ExpenseTag::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'name'  => 'sometimes|required|string|max:50',
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $tag->update($data);
        return response()->json(['data' => $tag->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tag = ExpenseTag::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $tag->expenses()->detach();
        $tag->delete();
        return response()->json(null, 204);
    }

    public function syncExpenseTags(Request $request, int $expenseId): JsonResponse
    {
        $expense = Expense::where('tenant_id', Auth::user()->tenant_id)->findOrFail($expenseId);

        $data = $request->validate([
            'tag_ids'   => 'required|array|max:10',
            'tag_ids.*' => 'integer|exists:expense_tags,id',
        ]);

        $validTagIds = ExpenseTag::where('tenant_id', Auth::user()->tenant_id)
            ->whereIn('id', $data['tag_ids'])
            ->pluck('id');

        $expense->tags()->sync($validTagIds);

        return response()->json(['data' => $expense->tags()->orderBy('name')->get()]);
    }
}
