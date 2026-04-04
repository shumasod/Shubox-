<?php

declare(strict_types=1);

namespace App\Domain\Expense\ValueObjects;

use InvalidArgumentException;

final class ExpenseStatus
{
    public const DRAFT = 'draft';
    public const PENDING = 'pending';
    public const PARTIALLY_APPROVED = 'partially_approved';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';
    public const CANCELLED = 'cancelled';
    public const PAID = 'paid';

    private const VALID_STATUSES = [
        self::DRAFT,
        self::PENDING,
        self::PARTIALLY_APPROVED,
        self::APPROVED,
        self::REJECTED,
        self::CANCELLED,
        self::PAID,
    ];

    /** @var array<string, string[]> 遷移可能なステータスマップ */
    private const TRANSITIONS = [
        self::DRAFT => [self::PENDING, self::CANCELLED],
        self::PENDING => [self::PARTIALLY_APPROVED, self::APPROVED, self::REJECTED, self::CANCELLED],
        self::PARTIALLY_APPROVED => [self::APPROVED, self::REJECTED],
        self::APPROVED => [self::PAID],
        self::REJECTED => [self::DRAFT],
        self::CANCELLED => [],
        self::PAID => [],
    ];

    private readonly string $value;

    public function __construct(string $value)
    {
        if (!in_array($value, self::VALID_STATUSES, true)) {
            throw new InvalidArgumentException("Invalid expense status: {$value}");
        }
        $this->value = $value;
    }

    public static function draft(): self
    {
        return new self(self::DRAFT);
    }

    public static function pending(): self
    {
        return new self(self::PENDING);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function canTransitionTo(self $newStatus): bool
    {
        return in_array($newStatus->value, self::TRANSITIONS[$this->value] ?? [], true);
    }

    public function transitionTo(self $newStatus): self
    {
        if (!$this->canTransitionTo($newStatus)) {
            throw new InvalidArgumentException(
                "Cannot transition from '{$this->value}' to '{$newStatus->value}'"
            );
        }
        return $newStatus;
    }

    public function isDraft(): bool
    {
        return $this->value === self::DRAFT;
    }

    public function isPending(): bool
    {
        return $this->value === self::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->value === self::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->value === self::REJECTED;
    }

    public function isCancelled(): bool
    {
        return $this->value === self::CANCELLED;
    }

    public function isPaid(): bool
    {
        return $this->value === self::PAID;
    }

    public function isEditable(): bool
    {
        return in_array($this->value, [self::DRAFT, self::REJECTED], true);
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
