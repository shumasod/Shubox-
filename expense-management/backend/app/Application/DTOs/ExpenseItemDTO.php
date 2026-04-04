<?php

declare(strict_types=1);

namespace App\Application\DTOs;

class ExpenseItemDTO
{
    public function __construct(
        public readonly string $categoryId,
        public readonly string $description,
        public readonly int $amount,
        public readonly string $expenseDate,
        public readonly int $quantity = 1,
        public readonly ?string $vendor = null,
        public readonly ?string $purpose = null,
        public readonly int $sortOrder = 0,
    ) {}
}
