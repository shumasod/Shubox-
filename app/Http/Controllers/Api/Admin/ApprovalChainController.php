<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApprovalChain;
use App\Models\ApprovalChainStep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApprovalChainController extends Controller
{
    public function index(): JsonResponse
    {
        $chains = ApprovalChain::forTenant(Auth::user()->tenant_id)
            ->with('steps')
            ->orderBy('priority')
            ->get();

        return response()->json($chains);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                         => 'required|string|max:100',
            'description'                  => 'nullable|string|max:500',
            'conditions'                   => 'nullable|array',
            'conditions.min_amount'        => 'nullable|numeric|min:0',
            'conditions.max_amount'        => 'nullable|numeric|min:0',
            'conditions.category_ids'      => 'nullable|array',
            'conditions.department_ids'    => 'nullable|array',
            'priority'                     => 'nullable|integer|min:1|max:100',
            'steps'                        => 'required|array|min:1',
            'steps.*.step_order'           => 'required|integer|min:1',
            'steps.*.approver_type'        => 'required|in:user,role,department_head,any_manager',
            'steps.*.approver_id'          => 'nullable|integer',
            'steps.*.approver_label'       => 'nullable|string|max:100',
            'steps.*.timeout_hours'        => 'nullable|integer|min:1|max:720',
            'steps.*.escalation_type'      => 'nullable|in:skip,reassign,notify',
            'steps.*.escalation_user_id'   => 'nullable|integer',
        ]);

        $chain = DB::transaction(function () use ($validated) {
            $chain = ApprovalChain::create(array_merge(
                $validated,
                ['tenant_id' => Auth::user()->tenant_id]
            ));

            foreach ($validated['steps'] as $step) {
                $chain->steps()->create($step);
            }

            return $chain->load('steps');
        });

        return response()->json($chain, 201);
    }

    public function show(int $id): JsonResponse
    {
        $chain = ApprovalChain::forTenant(Auth::user()->tenant_id)
            ->with('steps')
            ->findOrFail($id);

        return response()->json($chain);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $chain = ApprovalChain::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:100',
            'conditions' => 'sometimes|nullable|array',
            'priority'   => 'sometimes|integer|min:1|max:100',
            'is_active'  => 'sometimes|boolean',
        ]);

        $chain->update($validated);

        return response()->json($chain->load('steps'));
    }

    public function destroy(int $id): JsonResponse
    {
        $chain = ApprovalChain::forTenant(Auth::user()->tenant_id)->findOrFail($id);
        $chain->delete();
        return response()->json(null, 204);
    }
}
