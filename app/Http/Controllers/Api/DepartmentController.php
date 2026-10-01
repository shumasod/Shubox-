<?php

namespace App\Http\Controllers\Api;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $departments = Department::forTenant($tenantId)
            ->when($request->boolean('active_only', false), fn($q) => $q->active())
            ->when($request->boolean('tree'), fn($q) => $q->topLevel()->with('children.children'))
            ->when(! $request->boolean('tree'), fn($q) => $q->with('parent:id,name', 'manager:id,name'))
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json($departments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'code'            => 'nullable|string|max:20',
            'parent_id'       => 'nullable|integer|exists:departments,id',
            'manager_user_id' => 'nullable|integer|exists:users,id',
            'is_active'       => 'boolean',
        ]);

        $tenantId = Auth::user()->tenant_id;

        if (isset($validated['parent_id'])) {
            Department::forTenant($tenantId)->findOrFail($validated['parent_id']);
        }

        if (isset($validated['code'])) {
            $exists = Department::forTenant($tenantId)
                ->where('code', $validated['code'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'A department with this code already exists.',
                ], 409);
            }
        }

        $department = Department::create(array_merge($validated, [
            'tenant_id' => $tenantId,
        ]));

        return response()->json($department->load('parent:id,name', 'manager:id,name'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $department = Department::forTenant(Auth::user()->tenant_id)
            ->with('parent:id,name', 'manager:id,name', 'children:id,name,parent_id')
            ->withCount('users')
            ->findOrFail($id);

        return response()->json($department);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $department = Department::forTenant($tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:100',
            'code'            => 'nullable|string|max:20',
            'parent_id'       => 'nullable|integer',
            'manager_user_id' => 'nullable|integer|exists:users,id',
            'is_active'       => 'sometimes|boolean',
        ]);

        if (isset($validated['parent_id']) && $validated['parent_id'] === $id) {
            return response()->json(['message' => 'A department cannot be its own parent.'], 422);
        }

        $department->update($validated);

        return response()->json($department->load('parent:id,name', 'manager:id,name'));
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::forTenant(Auth::user()->tenant_id)
            ->withCount('users', 'children')
            ->findOrFail($id);

        if ($department->users_count > 0) {
            return response()->json([
                'message' => 'Cannot delete a department with assigned users.',
            ], 409);
        }

        if ($department->children_count > 0) {
            return response()->json([
                'message' => 'Cannot delete a department that has sub-departments.',
            ], 409);
        }

        $department->delete();

        return response()->json(null, 204);
    }
}
