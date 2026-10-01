<?php

namespace App\Services;

use App\Models\ExpensePolicy;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ExpensePolicyService
{
    public function check(User $user, int $categoryId, float $amount): array
    {
        $violations = [];
        $policies   = $this->resolveApplicablePolicies($user->tenant_id, $categoryId, $user->role);

        foreach ($policies as $policy) {
            if ($policy->max_amount !== null && $amount > $policy->max_amount) {
                $violations[] = [
                    'policy'  => $policy->name,
                    'type'    => 'max_amount_exceeded',
                    'limit'   => $policy->max_amount,
                    'actual'  => $amount,
                    'message' => "Amount {$amount} exceeds policy limit of {$policy->max_amount}.",
                ];
            }

            if ($policy->requires_receipt_above && $policy->receipt_threshold !== null && $amount > $policy->receipt_threshold) {
                $violations[] = [
                    'policy'  => $policy->name,
                    'type'    => 'receipt_required',
                    'limit'   => $policy->receipt_threshold,
                    'actual'  => $amount,
                    'message' => "Receipt required for amounts above {$policy->receipt_threshold}.",
                ];
            }

            if ($policy->requires_manager_note_above && $policy->manager_note_threshold !== null && $amount > $policy->manager_note_threshold) {
                $violations[] = [
                    'policy'  => $policy->name,
                    'type'    => 'manager_note_required',
                    'limit'   => $policy->manager_note_threshold,
                    'actual'  => $amount,
                    'message' => "Manager justification note required above {$policy->manager_note_threshold}.",
                ];
            }
        }

        if ($this->exceedsMonthlyLimit($user, $categoryId, $amount, $policies)) {
            $violations[] = [
                'type'    => 'monthly_limit_exceeded',
                'message' => 'This expense would exceed your monthly category limit.',
            ];
        }

        return [
            'passed'     => empty($violations),
            'violations' => $violations,
        ];
    }

    private function resolveApplicablePolicies(int $tenantId, int $categoryId, string $role): Collection
    {
        return ExpensePolicy::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where(function ($q) use ($categoryId, $role) {
                $q->whereNull('category_id')->whereNull('role')
                  ->orWhere('category_id', $categoryId)
                  ->orWhere('role', $role);
            })
            ->orderByDesc('priority')
            ->get();
    }

    private function exceedsMonthlyLimit(User $user, int $categoryId, float $amount, Collection $policies): bool
    {
        $monthlyLimitPolicy = $policies->whereNotNull('monthly_limit')->first();
        if (!$monthlyLimitPolicy) return false;

        $currentMonthTotal = DB::table('expenses')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('category_id', $categoryId)
            ->whereNotIn('status', ['rejected', 'draft'])
            ->whereYear('expense_date', now()->year)
            ->whereMonth('expense_date', now()->month)
            ->sum('amount');

        return ($currentMonthTotal + $amount) > $monthlyLimitPolicy->monthly_limit;
    }
}
