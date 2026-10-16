<?php

namespace App\Services;

use App\Models\ApprovalFlow;
use App\Models\Expense;

class ApprovalPolicyService
{
    /**
     * Resolve the approval flow that should handle this expense.
     * Rules evaluated in priority order (lower number = higher priority).
     */
    public function resolveFlow(Expense $expense): ?ApprovalFlow
    {
        $tenantId = $expense->tenant_id;
        $amount   = $expense->total_amount;

        return ApprovalFlow::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where(fn($q) =>
                $q->whereNull('min_amount')->orWhere('min_amount', '<=', $amount)
            )
            ->where(fn($q) =>
                $q->whereNull('max_amount')->orWhere('max_amount', '>=', $amount)
            )
            ->where(fn($q) =>
                $q->whereNull('department_id')
                  ->orWhere('department_id', $expense->department_id)
            )
            ->where(fn($q) =>
                $q->whereNull('category_id')
                  ->orWhere('category_id', $expense->category_id)
            )
            ->orderBy('priority')
            ->first();
    }

    /**
     * Build the ordered list of approver user-IDs for the given flow.
     */
    public function buildApproverChain(ApprovalFlow $flow): array
    {
        $steps = $flow->steps ?? [];

        usort($steps, fn($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));

        return array_map(fn($s) => (int) $s['approver_id'], $steps);
    }

    /**
     * Determine whether the expense can skip approval entirely.
     */
    public function canAutoApprove(Expense $expense): bool
    {
        $flow = $this->resolveFlow($expense);

        if ($flow === null) {
            return false;
        }

        return (bool) ($flow->auto_approve ?? false);
    }

    /**
     * Return the next approver in the chain, or null if fully approved.
     */
    public function nextApprover(Expense $expense): ?int
    {
        $flow = $this->resolveFlow($expense);

        if ($flow === null) {
            return null;
        }

        $chain    = $this->buildApproverChain($flow);
        $approved = $expense->approvalRecords()
            ->where('action', 'approved')
            ->pluck('approver_id')
            ->toArray();

        foreach ($chain as $approverId) {
            if (!in_array($approverId, $approved, true)) {
                return $approverId;
            }
        }

        return null;
    }
}
