<?php

declare(strict_types=1);

namespace App\Domain\Expense\Entities;

use App\Domain\Shared\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

class ExpenseItem
{
    /** @var Receipt[] */
    private array $receipts = [];

    public function __construct(
        private readonly string $id,
        private readonly string $expenseId,
        private readonly string $categoryId,
        private string $description,
        private Money $amount,
        private int $quantity,
        private DateTimeImmutable $expenseDate,
        private ?string $vendor,
        private ?string $purpose,
        private int $sortOrder,
    ) {
        if ($quantity < 1) {
            throw new InvalidArgumentException('Quantity must be at least 1.');
        }
    }

    public static function create(
        string $id,
        string $expenseId,
        string $categoryId,
        string $description,
        Money $amount,
        DateTimeImmutable $expenseDate,
        int $quantity = 1,
        ?string $vendor = null,
        ?string $purpose = null,
        int $sortOrder = 0,
    ): self {
        if (empty(trim($description))) {
            throw new InvalidArgumentException('Expense item description cannot be empty.');
        }

        return new self(
            id: $id,
            expenseId: $expenseId,
            categoryId: $categoryId,
            description: $description,
            amount: $amount,
            quantity: $quantity,
            expenseDate: $expenseDate,
            vendor: $vendor,
            purpose: $purpose,
            sortOrder: $sortOrder,
        );
    }

    public function addReceipt(Receipt $receipt): void
    {
        $this->receipts[] = $receipt;
    }

    public function getLineTotal(): Money
    {
        return Money::of($this->amount->getAmount() * $this->quantity, $this->amount->getCurrency());
    }

    // Getters
    public function getId(): string { return $this->id; }
    public function getExpenseId(): string { return $this->expenseId; }
    public function getCategoryId(): string { return $this->categoryId; }
    public function getDescription(): string { return $this->description; }
    public function getAmount(): Money { return $this->amount; }
    public function getQuantity(): int { return $this->quantity; }
    public function getExpenseDate(): DateTimeImmutable { return $this->expenseDate; }
    public function getVendor(): ?string { return $this->vendor; }
    public function getPurpose(): ?string { return $this->purpose; }
    public function getSortOrder(): int { return $this->sortOrder; }
    /** @return Receipt[] */
    public function getReceipts(): array { return $this->receipts; }
}
