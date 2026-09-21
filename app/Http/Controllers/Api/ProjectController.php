<?php

namespace App\Http\Controllers\Api;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $projects = Project::forTenant($tenantId)
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('department_id'), fn($q) => $q->where('department_id', $request->integer('department_id')))
            ->when($request->filled('search'), fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('code', 'like', '%' . $request->search . '%');
            }))
            ->with('department:id,name', 'owner:id,name')
            ->withCount('expenses')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:150',
            'code'            => 'nullable|string|max:30',
            'description'     => 'nullable|string|max:2000',
            'status'          => 'in:planning,active,on_hold,completed,cancelled',
            'department_id'   => 'nullable|integer|exists:departments,id',
            'owner_user_id'   => 'nullable|integer|exists:users,id',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'budget_amount'   => 'nullable|numeric|min:0',
            'budget_currency' => 'nullable|string|size:3',
        ]);

        $tenantId = Auth::user()->tenant_id;

        if (! empty($validated['code'])) {
            $exists = Project::forTenant($tenantId)->where('code', $validated['code'])->exists();
            if ($exists) {
                return response()->json(['message' => 'A project with this code already exists.'], 409);
            }
        }

        $project = Project::create(array_merge($validated, ['tenant_id' => $tenantId]));

        return response()->json($project->load('department:id,name', 'owner:id,name'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $project = Project::forTenant(Auth::user()->tenant_id)
            ->with('department:id,name', 'owner:id,name')
            ->withCount('expenses')
            ->findOrFail($id);

        return response()->json(array_merge($project->toArray(), [
            'spent_amount'        => $project->spent_amount,
            'budget_utilization'  => $project->budget_utilization,
        ]));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $project = Project::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:150',
            'code'            => 'nullable|string|max:30',
            'description'     => 'nullable|string|max:2000',
            'status'          => 'sometimes|in:planning,active,on_hold,completed,cancelled',
            'department_id'   => 'nullable|integer|exists:departments,id',
            'owner_user_id'   => 'nullable|integer|exists:users,id',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'budget_amount'   => 'nullable|numeric|min:0',
            'budget_currency' => 'nullable|string|size:3',
        ]);

        $project->update($validated);

        return response()->json($project->load('department:id,name', 'owner:id,name'));
    }

    public function destroy(int $id): JsonResponse
    {
        $project = Project::forTenant(Auth::user()->tenant_id)
            ->withCount('expenses')
            ->findOrFail($id);

        if ($project->expenses_count > 0) {
            return response()->json(['message' => 'Cannot delete a project with linked expenses.'], 409);
        }

        $project->delete();
        return response()->json(null, 204);
    }
}
