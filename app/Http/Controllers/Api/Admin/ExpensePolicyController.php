<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExpensePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpensePolicyController extends Controller
{
    public function index(): JsonResponse
    {
        $policies = ExpensePolicy::where('tenant_id', Auth::user()->tenant_id)
            ->with('category:id,name')
            ->orderByDesc('priority')
            ->get();

        return response()->json($policies);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                       => 'required|string|max:255',
            'category_id'                => 'nullable|integer|exists:expense_categories,id',
            'role'                       => 'nullable|in:user,manager,admin',
            'max_amount'                 => 'nullable|numeric|min:0',
            'monthly_limit'              => 'nullable|numeric|min:0',
            'requires_receipt_above'     => 'boolean',
            'receipt_threshold'          => 'nullable|numeric|min:0',
            'requires_manager_note_above' => 'boolean',
            'manager_note_threshold'     => 'nullable|numeric|min:0',
            'priority'                   => 'nullable|integer|min:0|max:100',
        ]);

        $policy = ExpensePolicy::create([
            ...$data,
            'tenant_id' => Auth::user()->tenant_id,
        ]);

        return response()->json($policy, 201);
    }

    public function update(Request $request, ExpensePolicy $policy): JsonResponse
    {
        abort_unless($policy->tenant_id === Auth::user()->tenant_id, 403);

        $policy->update($request->validate([
            'name'       => 'sometimes|string|max:255',
            'max_amount' => 'nullable|numeric|min:0',
            'monthly_limit' => 'nullable|numeric|min:0',
            'is_active'  => 'sometimes|boolean',
            'priority'   => 'nullable|integer|min:0|max:100',
        ]));

        return response()->json($policy->fresh('category:id,name'));
    }

    public function check(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|integer|exists:expense_categories,id',
            'amount'      => 'required|numeric|min:0',
        ]);

        $result = app(\App\Services\ExpensePolicyService::class)
            ->check(Auth::user(), $data['category_id'], (float) $data['amount']);

        return response()->json($result, $result['passed'] ? 200 : 422);
    }
}
