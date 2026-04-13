<?php

declare(strict_types=1);

namespace App\Application\UseCases\Expense;

use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use App\Domain\Expense\Services\ExpenseApprovalService;
use DomainException;

class ApproveExpenseUseCase
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
        private readonly ExpenseApprovalService $approvalService,
    ) {}

    public function execute(
        string $expenseId,
        string $tenantId,
        string $approverId,
        ?string $comment = null,
    ): Expense {
        $expense = $this->expenseRepository->findById($expenseId, $tenantId);

        if ($expense === null) {
            throw new DomainException('Expense not found.');
        }

        if (!$expense->getStatus()->isPending() &&
            $expense->getStatus()->getValue() !== 'partially_approved') {
            throw new DomainException('This expense is not awaiting approval.');
        }

        $this->approvalService->approve($expense, $approverId, $comment);

        return $expense;
    }
}
