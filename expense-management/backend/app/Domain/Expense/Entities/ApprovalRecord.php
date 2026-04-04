<?php

declare(strict_types=1);

namespace App\Domain\Expense\Entities;

use DateTimeImmutable;

class ApprovalRecord
{
    private readonly DateTimeImmutable $actedAt;

    public function __construct(
        private readonly string $expenseId,
        private readonly ?string $approvalStepId,
        private readonly string $approverId,
        private readonly string $action, // approved | rejected | delegated
        private readonly ?string $comment,
        private readonly int $step,
        private readonly ?string $delegatedTo = null,
    ) {
        $this->actedAt = new DateTimeImmutable();
    }

    public function isApproval(): bool { return $this->action === 'approved'; }
    public function isRejection(): bool { return $this->action === 'rejected'; }
    public function isDelegation(): bool { return $this->action === 'delegated'; }

    public function getExpenseId(): string { return $this->expenseId; }
    public function getApprovalStepId(): ?string { return $this->approvalStepId; }
    public function getApproverId(): string { return $this->approverId; }
    public function getAction(): string { return $this->action; }
    public function getComment(): ?string { return $this->comment; }
    public function getStep(): int { return $this->step; }
    public function getDelegatedTo(): ?string { return $this->delegatedTo; }
    public function getActedAt(): DateTimeImmutable { return $this->actedAt; }
}
