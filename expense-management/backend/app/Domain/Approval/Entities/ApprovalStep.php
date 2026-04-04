<?php

declare(strict_types=1);

namespace App\Domain\Approval\Entities;

class ApprovalStep
{
    public const TYPE_SPECIFIC_USER = 'specific_user';
    public const TYPE_ROLE = 'role';
    public const TYPE_MANAGER = 'manager';
    public const TYPE_DEPARTMENT_HEAD = 'department_head';

    public function __construct(
        private readonly string $id,
        private readonly string $approvalFlowId,
        private readonly int $stepNumber,
        private readonly string $stepName,
        private readonly string $approverType,
        private readonly ?string $approverId,
        private readonly ?string $approverRoleId,
        private readonly int $requiredCount,
        private readonly bool $allowDelegation,
        private readonly ?int $deadlineDays,
    ) {}

    /**
     * 指定ユーザーがこのステップで承認可能かチェック
     * ※ 実際の権限チェックはApplicationレイヤーで行う（ユーザー情報が必要なため）
     */
    public function canApprove(string $userId): bool
    {
        return match ($this->approverType) {
            self::TYPE_SPECIFIC_USER => $this->approverId === $userId,
            // role/manager/department_head は Application レイヤーで解決
            default => true,
        };
    }

    public function getId(): string { return $this->id; }
    public function getApprovalFlowId(): string { return $this->approvalFlowId; }
    public function getStepNumber(): int { return $this->stepNumber; }
    public function getStepName(): string { return $this->stepName; }
    public function getApproverType(): string { return $this->approverType; }
    public function getApproverId(): ?string { return $this->approverId; }
    public function getApproverRoleId(): ?string { return $this->approverRoleId; }
    public function getRequiredCount(): int { return $this->requiredCount; }
    public function allowDelegation(): bool { return $this->allowDelegation; }
    public function getDeadlineDays(): ?int { return $this->deadlineDays; }
}
