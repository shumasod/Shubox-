<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    public function index(): JsonResponse
    {
        $tags = Tag::where('tenant_id', Auth::user()->tenant_id)
            ->withCount('expenses')
            ->orderBy('name')
            ->get();

        return response()->json($tags);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:50',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $tag = Tag::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => $validated['name']],
            ['color'     => $validated['color'] ?? '#6B7280']
        );

        return response()->json($tag, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tag = Tag::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:50',
            'color' => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag->update($validated);

        return response()->json($tag);
    }

    public function destroy(int $id): JsonResponse
    {
        $tag = Tag::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $tag->expenses()->detach();
        $tag->delete();

        return response()->json(null, 204);
    }

    /** Sync tags on an expense (replaces all existing tags). */
    public function sync(Request $request, int $expenseId): JsonResponse
    {
        $validated = $request->validate([
            'tag_ids'   => 'present|array',
            'tag_ids.*' => 'integer',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $expense = Expense::where('tenant_id', $tenantId)->findOrFail($expenseId);

        // Only allow tags that belong to the same tenant
        $allowedIds = Tag::where('tenant_id', $tenantId)
            ->whereIn('id', $validated['tag_ids'])
            ->pluck('id');

        $expense->tags()->sync($allowedIds);

        return response()->json($expense->load('tags:id,name,color'));
    }
}
