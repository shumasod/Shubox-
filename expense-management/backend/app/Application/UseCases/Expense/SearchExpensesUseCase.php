<?php

declare(strict_types=1);

namespace App\Application\UseCases\Expense;

use App\Application\DTOs\ExpenseSearchDTO;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;

class SearchExpensesUseCase
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
    ) {}

    /**
     * @return array{data: array, total: int, per_page: int, current_page: int, last_page: int}
     */
    public function execute(ExpenseSearchDTO $dto): array
    {
        $filters = array_filter([
            'status' => $dto->status,
            'applicant_id' => $dto->applicantId,
            'category_id' => $dto->categoryId,
            'date_from' => $dto->dateFrom,
            'date_to' => $dto->dateTo,
            'amount_min' => $dto->amountMin,
            'amount_max' => $dto->amountMax,
            'keyword' => $dto->keyword,
            'sort_by' => $dto->sortBy,
            'sort_dir' => $dto->sortDir,
        ], fn($v) => $v !== null);

        $result = $this->expenseRepository->search(
            $dto->tenantId,
            $filters,
            $dto->perPage,
            $dto->page,
        );

        return [
            'data' => $result['data'],
            'total' => $result['total'],
            'per_page' => $result['per_page'],
            'current_page' => $result['current_page'],
            'last_page' => (int) ceil($result['total'] / $result['per_page']),
        ];
    }
}
