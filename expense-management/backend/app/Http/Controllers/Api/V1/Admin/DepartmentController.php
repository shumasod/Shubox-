<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::where('tenant_id', Auth::user()->tenant_id)
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn($d) => $this->format($d));

        return response()->json(['data' => $departments]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'code'        => 'required|string|max:20',
            'manager_id'  => 'nullable|exists:users,id',
            'parent_id'   => 'nullable|exists:departments,id',
            'description' => 'nullable|string|max:500',
        ]);

        $this->uniqueCheck($data['name'], $data['code']);

        $department = Department::create(array_merge($data, [
            'tenant_id' => Auth::user()->tenant_id,
        ]));

        return response()->json(['data' => $this->format($department->loadCount('users'))], 201);
    }

    public function show(int $id): JsonResponse
    {
        $department = Department::where('tenant_id', Auth::user()->tenant_id)
            ->withCount('users')
            ->with('manager:id,name,email')
            ->findOrFail($id);

        return response()->json(['data' => $this->format($department)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $department = Department::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:100',
            'code'        => 'sometimes|required|string|max:20',
            'manager_id'  => 'nullable|exists:users,id',
            'parent_id'   => 'nullable|exists:departments,id',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        $department->update($data);

        return response()->json(['data' => $this->format($department->fresh()->loadCount('users'))]);
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        if ($department->users_count > 0) {
            return response()->json(['message' => 'Cannot delete department with active users.'], 422);
        }

        $department->delete();
        return response()->json(null, 204);
    }

    private function uniqueCheck(string $name, string $code): void
    {
        $exists = Department::where('tenant_id', Auth::user()->tenant_id)
            ->where(fn($q) => $q->where('name', $name)->orWhere('code', $code))
            ->exists();

        if ($exists) {
            abort(422, 'Department name or code already exists.');
        }
    }

    private function format(Department $d): array
    {
        return [
            'id'          => $d->id,
            'name'        => $d->name,
            'code'        => $d->code,
            'manager_id'  => $d->manager_id,
            'manager'     => $d->relationLoaded('manager') ? $d->manager?->only(['id', 'name', 'email']) : null,
            'parent_id'   => $d->parent_id,
            'description' => $d->description,
            'is_active'   => (bool) $d->is_active,
            'users_count' => $d->users_count ?? 0,
            'created_at'  => $d->created_at->toIso8601String(),
        ];
    }
}
