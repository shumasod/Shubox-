<?php

declare(strict_types=1);

namespace App\Application\UseCases\Expense;

use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use App\Domain\Expense\Services\ExpenseApprovalService;
use DomainException;

class RejectExpenseUseCase
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
        private readonly ExpenseApprovalService $approvalService,
    ) {}

    public function execute(
        string $expenseId,
        string $tenantId,
        string $approverId,
        string $comment,
    ): Expense {
        $expense = $this->expenseRepository->findById($expenseId, $tenantId);

        if ($expense === null) {
            throw new DomainException('Expense not found.');
        }

        $this->approvalService->reject($expense, $approverId, $comment);

        return $expense;
    }
}
