<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ExpenseStateMachine
{
    private const TRANSITIONS = [
        'draft'    => ['pending'],
        'pending'  => ['approved', 'rejected', 'draft'],
        'approved' => ['paid', 'pending'],
        'rejected' => ['draft'],
        'paid'     => ['archived'],
        'archived' => [],
    ];

    private const ROLE_REQUIRED = [
        'approved' => ['manager', 'admin'],
        'rejected' => ['manager', 'admin'],
        'paid'     => ['admin'],
        'archived' => ['admin'],
    ];

    public function canTransition(Expense $expense, string $toStatus, User $user): bool
    {
        $allowed = self::TRANSITIONS[$expense->status] ?? [];
        if (!in_array($toStatus, $allowed, true)) {
            return false;
        }

        if (isset(self::ROLE_REQUIRED[$toStatus])) {
            return in_array($user->role, self::ROLE_REQUIRED[$toStatus], true);
        }

        // Submitter can retract from pending back to draft
        if ($toStatus === 'draft' && $expense->status === 'pending') {
            return $expense->user_id === $user->id || in_array($user->role, ['admin'], true);
        }

        return $expense->user_id === $user->id;
    }

    public function transition(Expense $expense, string $toStatus, ?string $comment = null): void
    {
        $user = Auth::user();

        abort_unless(
            $this->canTransition($expense, $toStatus, $user),
            403,
            "Cannot transition from '{$expense->status}' to '{$toStatus}'."
        );

        $previousStatus = $expense->status;

        $updates = ['status' => $toStatus];

        match ($toStatus) {
            'pending'  => $updates['submitted_at'] = now(),
            'approved' => $updates['approved_at']  = now(),
            'paid'     => $updates['paid_at']      = now(),
            'archived' => $updates['archived_at']  = now(),
            default    => null,
        };

        $expense->update($updates);

        \App\Models\AuditLog::create([
            'tenant_id'  => $expense->tenant_id,
            'user_id'    => $user->id,
            'action'     => 'expense.status_changed',
            'auditable_type' => Expense::class,
            'auditable_id'   => $expense->id,
            'old_values' => ['status' => $previousStatus],
            'new_values' => ['status' => $toStatus, 'comment' => $comment],
        ]);
    }

    public function allowedTransitions(Expense $expense, User $user): array
    {
        return array_values(array_filter(
            self::TRANSITIONS[$expense->status] ?? [],
            fn($to) => $this->canTransition($expense, $to, $user)
        ));
    }
}
