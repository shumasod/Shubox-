<?php

declare(strict_types=1);

namespace App\Application\DTOs;

class ExpenseSearchDTO
{
    public function __construct(
        public readonly string $tenantId,
        public readonly ?string $status = null,
        public readonly ?string $applicantId = null,
        public readonly ?string $categoryId = null,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null,
        public readonly ?int $amountMin = null,
        public readonly ?int $amountMax = null,
        public readonly ?string $keyword = null,
        public readonly int $perPage = 20,
        public readonly int $page = 1,
        public readonly string $sortBy = 'created_at',
        public readonly string $sortDir = 'desc',
    ) {}
}
