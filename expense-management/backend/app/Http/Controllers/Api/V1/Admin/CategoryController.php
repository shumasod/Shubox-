<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\CategoryModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId   = $request->attributes->get('tenant_id');
        $categories = CategoryModel::where('tenant_id', $tenantId)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => $this->format($c));

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId  = $request->attributes->get('tenant_id');
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'code'        => ['required', 'string', 'max:50', 'alpha_num'],
            'description' => ['nullable', 'string', 'max:500'],
            'parent_id'   => ['nullable', 'uuid', 'exists:categories,id'],
            'sort_order'  => ['integer', 'min:0'],
        ]);

        $category = CategoryModel::create([
            'id'          => Str::uuid()->toString(),
            'tenant_id'   => $tenantId,
            'name'        => $validated['name'],
            'code'        => strtoupper($validated['code']),
            'description' => $validated['description'] ?? null,
            'parent_id'   => $validated['parent_id'] ?? null,
            'sort_order'  => $validated['sort_order'] ?? 0,
            'is_active'   => true,
        ]);

        return response()->json(['data' => $this->format($category)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $category = CategoryModel::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order'  => ['integer', 'min:0'],
            'is_active'   => ['boolean'],
        ]);

        $category->update($validated);

        return response()->json(['data' => $this->format($category)]);
    }

    private function format(CategoryModel $c): array
    {
        return [
            'id'          => $c->id,
            'name'        => $c->name,
            'code'        => $c->code,
            'description' => $c->description,
            'parent_id'   => $c->parent_id,
            'sort_order'  => $c->sort_order,
            'is_active'   => $c->is_active,
        ];
    }
}
