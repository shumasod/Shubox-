<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\ExpensePolicy;
use Illuminate\Support\Collection;

class ExpensePolicyEnforcementService
{
    /**
     * Check an expense against all active policies and return violations.
     *
     * @return Collection<array{policy_id: int, rule: string, message: string, action: string}>
     */
    public function evaluate(Expense $expense): Collection
    {
        $policies = ExpensePolicy::where('tenant_id', $expense->tenant_id)
            ->where('is_active', true)
            ->get();

        $violations = collect();

        foreach ($policies as $policy) {
            $rules = $policy->rules ?? [];

            foreach ($rules as $rule) {
                if ($this->ruleMatches($expense, $rule)) {
                    $violations->push([
                        'policy_id' => $policy->id,
                        'rule'      => $rule['type'],
                        'message'   => $this->buildMessage($rule, $expense),
                        'action'    => $rule['action'] ?? 'flag',
                    ]);
                }
            }
        }

        return $violations;
    }

    public function enforce(Expense $expense): void
    {
        $violations = $this->evaluate($expense);

        if ($violations->isEmpty()) {
            return;
        }

        $autoReject = $violations->contains('action', 'reject');

        $expense->update([
            'policy_violations' => $violations->toArray(),
            'status'            => $autoReject ? 'rejected' : 'flagged',
            'rejection_reason'  => $autoReject
                ? 'Automatically rejected: ' . $violations->where('action', 'reject')->first()['message']
                : null,
        ]);
    }

    private function ruleMatches(Expense $expense, array $rule): bool
    {
        return match ($rule['type']) {
            'max_amount'        => $expense->amount > ($rule['limit'] ?? PHP_INT_MAX),
            'category_blocked'  => in_array($expense->category_id, $rule['category_ids'] ?? [], strict: true),
            'requires_receipt'  => $expense->amount >= ($rule['min_amount'] ?? 0)
                                    && !$expense->attachments()->exists(),
            'weekend_purchase'  => in_array(
                                    now()->parse($expense->expense_date)->dayOfWeek,
                                    [0, 6]
                                   ) && !($rule['allow_weekend'] ?? false),
            'daily_limit'       => $this->dailyTotal($expense) > ($rule['limit'] ?? PHP_INT_MAX),
            'monthly_limit'     => $this->monthlyTotal($expense) > ($rule['limit'] ?? PHP_INT_MAX),
            default             => false,
        };
    }

    private function buildMessage(array $rule, Expense $expense): string
    {
        return match ($rule['type']) {
            'max_amount'       => "Amount {$expense->amount} exceeds policy limit of {$rule['limit']}",
            'category_blocked' => 'Expense category is not permitted under current policy',
            'requires_receipt' => 'Receipt attachment required for expenses above ' . ($rule['min_amount'] ?? 0),
            'weekend_purchase' => 'Weekend purchases require prior approval',
            'daily_limit'      => 'Daily spend limit of ' . $rule['limit'] . ' would be exceeded',
            'monthly_limit'    => 'Monthly spend limit of ' . $rule['limit'] . ' would be exceeded',
            default            => 'Policy violation: ' . $rule['type'],
        };
    }

    private function dailyTotal(Expense $expense): float
    {
        return (float) Expense::where('tenant_id', $expense->tenant_id)
            ->where('user_id', $expense->user_id)
            ->where('expense_date', $expense->expense_date)
            ->where('id', '!=', $expense->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');
    }

    private function monthlyTotal(Expense $expense): float
    {
        $date = now()->parse($expense->expense_date);
        return (float) Expense::where('tenant_id', $expense->tenant_id)
            ->where('user_id', $expense->user_id)
            ->whereYear('expense_date', $date->year)
            ->whereMonth('expense_date', $date->month)
            ->where('id', '!=', $expense->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');
    }
}
