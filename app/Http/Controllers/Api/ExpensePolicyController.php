<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpensePolicyController extends Controller
{
    public function index(): JsonResponse
    {
        $policies = DB::table('expense_policies')
            ->where('tenant_id', Auth::user()->tenant_id)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $policies]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'name'                       => 'required|string|max:100',
            'applies_to_roles'           => 'required|array|min:1',
            'applies_to_roles.*'         => 'string|in:employee,manager,admin',
            'category_id'               => 'nullable|integer|exists:expense_categories,id',
            'max_amount_per_submission'  => 'nullable|integer|min:1',
            'max_amount_per_day'         => 'nullable|integer|min:1',
            'max_amount_per_month'       => 'nullable|integer|min:1',
            'receipt_required'           => 'boolean',
            'receipt_required_above'     => 'nullable|integer|min:0',
            'requires_project'           => 'boolean',
            'requires_pre_approval'      => 'boolean',
            'notes'                      => 'nullable|string|max:2000',
        ]);

        // Ensure category belongs to this tenant if specified
        if (!empty($validated['category_id'])) {
            $exists = DB::table('expense_categories')
                ->where('id', $validated['category_id'])
                ->where('tenant_id', $tenantId)
                ->exists();
            if (!$exists) {
                return response()->json(['message' => 'カテゴリが見つかりません'], 404);
            }
        }

        $id = DB::table('expense_policies')->insertGetId(array_merge($validated, [
            'tenant_id'         => $tenantId,
            'applies_to_roles'  => json_encode($validated['applies_to_roles']),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]));

        return response()->json(['data' => DB::table('expense_policies')->find($id)], 201);
    }

    public function show(int $id): JsonResponse
    {
        $policy = DB::table('expense_policies')
            ->where('tenant_id', Auth::user()->tenant_id)
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$policy) return response()->json(['message' => 'Not found'], 404);

        return response()->json(['data' => $policy]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $policy = DB::table('expense_policies')
            ->where('tenant_id', $tenantId)
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$policy) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'name'                       => 'sometimes|string|max:100',
            'applies_to_roles'           => 'sometimes|array|min:1',
            'applies_to_roles.*'         => 'string|in:employee,manager,admin',
            'max_amount_per_submission'  => 'nullable|integer|min:1',
            'max_amount_per_day'         => 'nullable|integer|min:1',
            'max_amount_per_month'       => 'nullable|integer|min:1',
            'receipt_required'           => 'boolean',
            'receipt_required_above'     => 'nullable|integer|min:0',
            'requires_project'           => 'boolean',
            'is_active'                  => 'boolean',
        ]);

        if (isset($validated['applies_to_roles'])) {
            $validated['applies_to_roles'] = json_encode($validated['applies_to_roles']);
        }

        DB::table('expense_policies')
            ->where('id', $id)
            ->update(array_merge($validated, ['updated_at' => now()]));

        return response()->json(['data' => DB::table('expense_policies')->find($id)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $affected = DB::table('expense_policies')
            ->where('tenant_id', Auth::user()->tenant_id)
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->update(['deleted_at' => now()]);

        if (!$affected) return response()->json(['message' => 'Not found'], 404);

        return response()->json(null, 204);
    }

    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|integer',
            'amount'      => 'required|integer|min:1',
            'user_role'   => 'required|string',
            'expense_date' => 'required|date',
        ]);

        $tenantId    = Auth::user()->tenant_id;
        $userId      = Auth::id();
        $categoryId  = $validated['category_id'];
        $amount      = $validated['amount'];
        $role        = $validated['user_role'];
        $date        = $validated['expense_date'];
        $violations  = [];

        $policies = DB::table('expense_policies')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->where(fn ($q) => $q->whereNull('category_id')->orWhere('category_id', $categoryId))
            ->get();

        foreach ($policies as $policy) {
            $roles = json_decode($policy->applies_to_roles, true);
            if (!in_array($role, $roles, true)) continue;

            if ($policy->max_amount_per_submission && $amount > $policy->max_amount_per_submission) {
                $violations[] = [
                    'policy' => $policy->name,
                    'field'  => 'amount',
                    'reason' => "1回の申請上限額({$policy->max_amount_per_submission}円)を超えています",
                ];
            }

            if ($policy->receipt_required_above && $amount >= $policy->receipt_required_above) {
                $violations[] = [
                    'policy'  => $policy->name,
                    'field'   => 'receipt',
                    'reason'  => "{$policy->receipt_required_above}円以上は領収書が必要です",
                    'warning' => true,
                ];
            }

            if ($policy->max_amount_per_day) {
                $dailyTotal = DB::table('expenses')
                    ->where('user_id', $userId)
                    ->where('tenant_id', $tenantId)
                    ->whereDate('expense_date', $date)
                    ->whereIn('status', ['draft', 'submitted', 'approved'])
                    ->sum('amount');

                if ($dailyTotal + $amount > $policy->max_amount_per_day) {
                    $violations[] = [
                        'policy' => $policy->name,
                        'field'  => 'amount',
                        'reason' => "1日の上限額({$policy->max_amount_per_day}円)を超えます",
                    ];
                }
            }
        }

        $hardViolations = array_filter($violations, fn ($v) => empty($v['warning']));

        return response()->json([
            'valid'      => empty($hardViolations),
            'violations' => $violations,
        ]);
    }
}
