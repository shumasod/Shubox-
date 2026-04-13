<?php

declare(strict_types=1);

namespace App\Application\UseCases\Expense;

use App\Domain\Approval\Repositories\ApprovalFlowRepositoryInterface;
use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use DomainException;

class SubmitExpenseUseCase
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
        private readonly ApprovalFlowRepositoryInterface $approvalFlowRepository,
    ) {}

    public function execute(string $expenseId, string $tenantId, string $userId): Expense
    {
        $expense = $this->expenseRepository->findById($expenseId, $tenantId);

        if ($expense === null) {
            throw new DomainException('Expense not found.');
        }

        if ($expense->getApplicantId() !== $userId) {
            throw new DomainException('You are not authorized to submit this expense.');
        }

        // 承認フローが未設定の場合、金額・カテゴリに合わせたフローを自動選択
        if ($expense->getApprovalFlowId() === null) {
            $totalAmount = $expense->getTotalAmount()->getAmount();
            $firstItem = $expense->getItems()[0] ?? null;
            $categoryId = $firstItem?->getCategoryId();

            $flow = $this->approvalFlowRepository->findMatching($tenantId, $totalAmount, $categoryId)
                ?? $this->approvalFlowRepository->findDefault($tenantId);

            if ($flow === null) {
                throw new DomainException('No approval flow found. Please configure an approval flow first.');
            }

            // NOTE: Expense に approvalFlowId を設定するためにリフレクションか
            // ファクトリメソッドが必要。実際の実装では Eloquent モデルで直接管理。
        }

        $expense->submit();
        $this->expenseRepository->save($expense);

        return $expense;
    }
}
