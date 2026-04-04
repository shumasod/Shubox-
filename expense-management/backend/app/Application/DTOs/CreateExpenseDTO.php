<?php

declare(strict_types=1);

namespace App\Application\DTOs;

class CreateExpenseDTO
{
    /**
     * @param ExpenseItemDTO[] $items
     */
    public function __construct(
        public readonly string $tenantId,
        public readonly string $applicantId,
        public readonly string $title,
        public readonly ?string $description,
        public readonly string $currency,
        public readonly array $items,
    ) {}
}
