<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $query = ExpenseCategory::forTenant($tenantId)
            ->with('children')
            ->roots()
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->boolean('active_only')) {
            $query->active();
        }

        if ($request->boolean('flat')) {
            $categories = ExpenseCategory::forTenant($tenantId)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();

            return response()->json(['data' => $categories]);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'name'                     => 'required|string|max:100',
            'code'                     => ['required', 'string', 'max:32', 'regex:/^[A-Z0-9_]+$/',
                                           Rule::unique('expense_categories')->where('tenant_id', $tenantId)->whereNull('deleted_at')],
            'parent_id'                => 'nullable|integer|exists:expense_categories,id',
            'color'                    => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'                     => 'nullable|string|max:64',
            'requires_receipt'         => 'boolean',
            'receipt_threshold_amount' => 'nullable|integer|min:0',
            'sort_order'               => 'integer|min:0',
        ]);

        if (isset($validated['parent_id'])) {
            $parent = ExpenseCategory::forTenant($tenantId)->findOrFail($validated['parent_id']);
            // Prevent nesting beyond 2 levels
            if ($parent->parent_id !== null) {
                return response()->json(['message' => 'カテゴリの階層は2段階までです'], 422);
            }
        }

        $category = ExpenseCategory::create(array_merge($validated, ['tenant_id' => $tenantId]));

        return response()->json(['data' => $category], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = ExpenseCategory::forTenant(Auth::user()->tenant_id)
            ->with(['parent', 'children', 'budgetAllocations'])
            ->findOrFail($id);

        return response()->json(['data' => $category]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $category = ExpenseCategory::forTenant($tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'                     => 'sometimes|string|max:100',
            'code'                     => ['sometimes', 'string', 'max:32', 'regex:/^[A-Z0-9_]+$/',
                                           Rule::unique('expense_categories')->where('tenant_id', $tenantId)->whereNull('deleted_at')->ignore($id)],
            'parent_id'                => 'nullable|integer|exists:expense_categories,id',
            'color'                    => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'                     => 'nullable|string|max:64',
            'requires_receipt'         => 'boolean',
            'receipt_threshold_amount' => 'nullable|integer|min:0',
            'is_active'                => 'boolean',
            'sort_order'               => 'integer|min:0',
        ]);

        if (isset($validated['parent_id']) && $validated['parent_id'] === $id) {
            return response()->json(['message' => '自分自身を親カテゴリに設定できません'], 422);
        }

        $category->update($validated);

        return response()->json(['data' => $category->fresh(['parent', 'children'])]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $category = ExpenseCategory::forTenant($tenantId)->withCount('children')->findOrFail($id);

        if ($category->children_count > 0) {
            return response()->json(['message' => '子カテゴリが存在するため削除できません'], 409);
        }

        $hasExpenses = \DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->where('category_id', $id)
            ->exists();

        if ($hasExpenses) {
            return response()->json(['message' => '経費が紐付いているため削除できません'], 409);
        }

        $category->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'items'            => 'required|array',
            'items.*.id'       => 'required|integer',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            ExpenseCategory::forTenant($tenantId)
                ->where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => '並び順を更新しました']);
    }
}
