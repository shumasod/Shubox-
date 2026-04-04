<?php

declare(strict_types=1);

namespace App\Domain\Expense\Services;

use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use App\Domain\Approval\Repositories\ApprovalFlowRepositoryInterface;
use DomainException;

class ExpenseApprovalService
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
        private readonly ApprovalFlowRepositoryInterface $approvalFlowRepository,
    ) {}

    public function approve(
        Expense $expense,
        string $approverId,
        ?string $comment = null,
    ): void {
        $flow = $this->approvalFlowRepository->findById(
            $expense->getApprovalFlowId(),
            $expense->getTenantId(),
        );

        if ($flow === null) {
            throw new DomainException('Approval flow not found.');
        }

        $currentStep = $expense->getCurrentStep();
        $step = $flow->getStep($currentStep);

        if ($step === null) {
            throw new DomainException("Step {$currentStep} not found in approval flow.");
        }

        // 承認権限チェック
        if (!$step->canApprove($approverId)) {
            throw new DomainException('You are not authorized to approve this expense at this step.');
        }

        $expense->approve($approverId, $currentStep, $comment);

        $nextStep = $flow->getStep($currentStep + 1);
        if ($nextStep === null) {
            // 最終ステップ → 全承認
            $expense->fullyApprove();
        } else {
            // 次ステップへ
            $expense->partiallyApprove();
        }

        $this->expenseRepository->save($expense);
    }

    public function reject(
        Expense $expense,
        string $approverId,
        string $comment,
    ): void {
        $flow = $this->approvalFlowRepository->findById(
            $expense->getApprovalFlowId(),
            $expense->getTenantId(),
        );

        if ($flow === null) {
            throw new DomainException('Approval flow not found.');
        }

        $currentStep = $expense->getCurrentStep();
        $step = $flow->getStep($currentStep);

        if ($step === null || !$step->canApprove($approverId)) {
            throw new DomainException('You are not authorized to reject this expense.');
        }

        $expense->reject($approverId, $currentStep, $comment);
        $this->expenseRepository->save($expense);
    }
}
