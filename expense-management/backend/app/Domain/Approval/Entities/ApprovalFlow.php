<?php

declare(strict_types=1);

namespace App\Domain\Approval\Entities;

use InvalidArgumentException;

class ApprovalFlow
{
    /** @var ApprovalStep[] */
    private array $steps = [];

    public function __construct(
        private readonly string $id,
        private readonly string $tenantId,
        private string $name,
        private ?string $description,
        private bool $isDefault,
        private ?int $minAmount,
        private ?int $maxAmount,
        private ?array $categoryIds,
        private bool $isActive,
    ) {}

    public static function create(
        string $id,
        string $tenantId,
        string $name,
        bool $isDefault = false,
        ?int $minAmount = null,
        ?int $maxAmount = null,
        ?array $categoryIds = null,
    ): self {
        if (empty(trim($name))) {
            throw new InvalidArgumentException('Approval flow name cannot be empty.');
        }

        return new self(
            id: $id,
            tenantId: $tenantId,
            name: $name,
            description: null,
            isDefault: $isDefault,
            minAmount: $minAmount,
            maxAmount: $maxAmount,
            categoryIds: $categoryIds,
            isActive: true,
        );
    }

    public function addStep(ApprovalStep $step): void
    {
        $this->steps[] = $step;
        usort($this->steps, fn($a, $b) => $a->getStepNumber() <=> $b->getStepNumber());
    }

    public function getStep(int $stepNumber): ?ApprovalStep
    {
        foreach ($this->steps as $step) {
            if ($step->getStepNumber() === $stepNumber) {
                return $step;
            }
        }
        return null;
    }

    /**
     * 指定金額・カテゴリに対してこのフローが適用可能か判定
     */
    public function matches(int $amount, ?string $categoryId): bool
    {
        if ($this->minAmount !== null && $amount < $this->minAmount) {
            return false;
        }
        if ($this->maxAmount !== null && $amount > $this->maxAmount) {
            return false;
        }
        if ($this->categoryIds !== null && $categoryId !== null) {
            if (!in_array($categoryId, $this->categoryIds, true)) {
                return false;
            }
        }
        return true;
    }

    public function getId(): string { return $this->id; }
    public function getTenantId(): string { return $this->tenantId; }
    public function getName(): string { return $this->name; }
    public function getDescription(): ?string { return $this->description; }
    public function isDefault(): bool { return $this->isDefault; }
    public function getMinAmount(): ?int { return $this->minAmount; }
    public function getMaxAmount(): ?int { return $this->maxAmount; }
    public function getCategoryIds(): ?array { return $this->categoryIds; }
    public function isActive(): bool { return $this->isActive; }
    /** @return ApprovalStep[] */
    public function getSteps(): array { return $this->steps; }
    public function getTotalSteps(): int { return count($this->steps); }
}
