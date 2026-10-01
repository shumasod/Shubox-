<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = ExpenseCategory::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'required|string|max:100',
            'icon'                => 'nullable|string|max:50',
            'color'               => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'monthly_budget_limit'=> 'nullable|integer|min:0',
            'sort_order'          => 'nullable|integer|min:0',
        ]);

        $tenantId = $request->user()->tenant_id;
        $slug     = $this->uniqueSlug($tenantId, Str::slug($data['name']));

        $category = ExpenseCategory::create(array_merge($data, [
            'tenant_id' => $tenantId,
            'slug'      => $slug,
        ]));

        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = ExpenseCategory::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'name'                => 'sometimes|string|max:100',
            'icon'                => 'nullable|string|max:50',
            'color'               => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'monthly_budget_limit'=> 'nullable|integer|min:0',
            'sort_order'          => 'nullable|integer|min:0',
            'is_active'           => 'sometimes|boolean',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = $this->uniqueSlug($request->user()->tenant_id, Str::slug($data['name']), $id);
        }

        $category->update($data);
        return response()->json(['data' => $category->fresh()]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = ExpenseCategory::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        if ($category->expenses()->exists()) {
            return response()->json(['message' => 'Cannot delete category with existing expenses. Deactivate it instead.'], 422);
        }

        $category->delete();
        return response()->json(null, 204);
    }

    private function uniqueSlug(int $tenantId, string $base, ?int $excludeId = null): string
    {
        $slug = $base;
        $i    = 1;
        while (
            ExpenseCategory::where('tenant_id', $tenantId)
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }
}
