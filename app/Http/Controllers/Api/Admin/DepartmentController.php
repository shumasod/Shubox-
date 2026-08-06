<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $departments = Department::with('children')
            ->forTenant($request->user()->tenant_id)
            ->roots()
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $departments]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'code'           => 'nullable|string|max:30',
            'parent_id'      => 'nullable|integer',
            'monthly_budget' => 'nullable|integer|min:0',
        ]);

        $tenantId = $request->user()->tenant_id;

        if (isset($data['parent_id'])) {
            $parent = Department::forTenant($tenantId)->findOrFail($data['parent_id']);
            $data['depth'] = $parent->depth + 1;
        }

        $department = Department::create(array_merge($data, ['tenant_id' => $tenantId]));

        return response()->json(['data' => $department], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $department = Department::forTenant($request->user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'name'           => 'sometimes|string|max:100',
            'code'           => 'nullable|string|max:30',
            'monthly_budget' => 'nullable|integer|min:0',
            'is_active'      => 'sometimes|boolean',
        ]);

        $department->update($data);
        return response()->json(['data' => $department->fresh()]);
    }

    public function budget(Request $request, int $id): JsonResponse
    {
        $department = Department::forTenant($request->user()->tenant_id)->findOrFail($id);

        $spent = \App\Models\Expense::where('tenant_id', $request->user()->tenant_id)
            ->where('department_id', $id)
            ->whereIn('status', ['approved', 'paid'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        return response()->json([
            'department'     => $department->name,
            'monthly_budget' => $department->monthly_budget,
            'spent_mtd'      => $spent,
            'remaining'      => max(0, ($department->monthly_budget ?? 0) - $spent),
            'utilization_pct'=> $department->monthly_budget
                ? round(($spent / $department->monthly_budget) * 100, 1)
                : null,
        ]);
    }
}
