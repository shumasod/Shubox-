<?php

declare(strict_types=1);

namespace App\Domain\Expense\Entities;

use App\Domain\Expense\ValueObjects\ExpenseNumber;
use App\Domain\Expense\ValueObjects\ExpenseStatus;
use App\Domain\Shared\ValueObjects\Money;
use DateTimeImmutable;
use DomainException;
use InvalidArgumentException;

class Expense
{
    private ExpenseStatus $status;
    private ?DateTimeImmutable $appliedAt = null;
    private ?DateTimeImmutable $approvedAt = null;

    /** @var ExpenseItem[] */
    private array $items = [];

    /** @var ApprovalRecord[] */
    private array $approvalRecords = [];

    public function __construct(
        private readonly string $id,
        private readonly string $tenantId,
        private readonly string $applicantId,
        private ExpenseNumber $expenseNumber,
        private string $title,
        private ?string $description,
        private readonly string $currency,
        private ?string $approvalFlowId,
        private int $currentStep,
    ) {
        $this->status = ExpenseStatus::draft();
    }

    public static function create(
        string $id,
        string $tenantId,
        string $applicantId,
        ExpenseNumber $expenseNumber,
        string $title,
        ?string $description = null,
        string $currency = 'JPY',
        ?string $approvalFlowId = null,
    ): self {
        if (empty(trim($title))) {
            throw new InvalidArgumentException('Expense title cannot be empty.');
        }
        if (mb_strlen($title) > 200) {
            throw new InvalidArgumentException('Expense title must be 200 characters or less.');
        }

        return new self(
            id: $id,
            tenantId: $tenantId,
            applicantId: $applicantId,
            expenseNumber: $expenseNumber,
            title: $title,
            description: $description,
            currency: $currency,
            approvalFlowId: $approvalFlowId,
            currentStep: 0,
        );
    }

    public function submit(): void
    {
        if (!$this->status->isDraft() && !$this->status->isRejected()) {
            throw new DomainException('Only draft or rejected expenses can be submitted.');
        }
        if (empty($this->items)) {
            throw new DomainException('Cannot submit expense without items.');
        }

        $this->status = $this->status->transitionTo(ExpenseStatus::pending());
        $this->appliedAt = new DateTimeImmutable();
        $this->currentStep = 1;
    }

    public function approve(string $approverId, int $step, ?string $comment = null): void
    {
        if (!$this->status->isPending() && $this->status->getValue() !== ExpenseStatus::PARTIALLY_APPROVED) {
            throw new DomainException('Only pending expenses can be approved.');
        }

        $this->approvalRecords[] = new ApprovalRecord(
            expenseId: $this->id,
            approvalStepId: null,
            approverId: $approverId,
            action: 'approved',
            comment: $comment,
            step: $step,
        );
    }

    public function fullyApprove(): void
    {
        $pending = ExpenseStatus::pending();
        $partial = new ExpenseStatus(ExpenseStatus::PARTIALLY_APPROVED);
        $approved = new ExpenseStatus(ExpenseStatus::APPROVED);

        if ($this->status->isPending()) {
            $this->status = $this->status->transitionTo($approved);
        } elseif ($this->status->getValue() === ExpenseStatus::PARTIALLY_APPROVED) {
            $this->status = $partial->transitionTo($approved);
        } else {
            throw new DomainException('Cannot fully approve in current status.');
        }

        $this->approvedAt = new DateTimeImmutable();
    }

    public function partiallyApprove(): void
    {
        $partial = new ExpenseStatus(ExpenseStatus::PARTIALLY_APPROVED);
        $this->status = $this->status->transitionTo($partial);
        $this->currentStep++;
    }

    public function reject(string $approverId, int $step, string $comment): void
    {
        if (!$this->status->isPending() && $this->status->getValue() !== ExpenseStatus::PARTIALLY_APPROVED) {
            throw new DomainException('Only pending or partially approved expenses can be rejected.');
        }
        if (empty(trim($comment))) {
            throw new InvalidArgumentException('Rejection comment is required.');
        }

        $rejected = new ExpenseStatus(ExpenseStatus::REJECTED);
        $this->status = $this->status->transitionTo($rejected);

        $this->approvalRecords[] = new ApprovalRecord(
            expenseId: $this->id,
            approvalStepId: null,
            approverId: $approverId,
            action: 'rejected',
            comment: $comment,
            step: $step,
        );
    }

    public function cancel(string $userId): void
    {
        if ($this->applicantId !== $userId) {
            throw new DomainException('Only the applicant can cancel the expense.');
        }
        if ($this->status->isApproved() || $this->status->isPaid()) {
            throw new DomainException('Approved or paid expenses cannot be cancelled.');
        }

        $cancelled = new ExpenseStatus(ExpenseStatus::CANCELLED);
        $this->status = $this->status->transitionTo($cancelled);
    }

    public function markAsPaid(): void
    {
        if (!$this->status->isApproved()) {
            throw new DomainException('Only approved expenses can be marked as paid.');
        }
        $paid = new ExpenseStatus(ExpenseStatus::PAID);
        $this->status = $this->status->transitionTo($paid);
    }

    public function addItem(ExpenseItem $item): void
    {
        if (!$this->status->isEditable()) {
            throw new DomainException('Cannot add items to non-editable expense.');
        }
        $this->items[] = $item;
    }

    public function updateTitle(string $title): void
    {
        if (!$this->status->isEditable()) {
            throw new DomainException('Cannot update non-editable expense.');
        }
        if (empty(trim($title))) {
            throw new InvalidArgumentException('Title cannot be empty.');
        }
        $this->title = $title;
    }

    public function getTotalAmount(): Money
    {
        $total = Money::of(0, $this->currency);
        foreach ($this->items as $item) {
            $total = $total->add($item->getAmount());
        }
        return $total;
    }

    // Getters
    public function getId(): string { return $this->id; }
    public function getTenantId(): string { return $this->tenantId; }
    public function getApplicantId(): string { return $this->applicantId; }
    public function getExpenseNumber(): ExpenseNumber { return $this->expenseNumber; }
    public function getTitle(): string { return $this->title; }
    public function getDescription(): ?string { return $this->description; }
    public function getStatus(): ExpenseStatus { return $this->status; }
    public function getCurrency(): string { return $this->currency; }
    public function getApprovalFlowId(): ?string { return $this->approvalFlowId; }
    public function getCurrentStep(): int { return $this->currentStep; }
    public function getAppliedAt(): ?DateTimeImmutable { return $this->appliedAt; }
    public function getApprovedAt(): ?DateTimeImmutable { return $this->approvedAt; }
    /** @return ExpenseItem[] */
    public function getItems(): array { return $this->items; }
    /** @return ApprovalRecord[] */
    public function getApprovalRecords(): array { return $this->approvalRecords; }
}
