<?php

declare(strict_types=1);

namespace App\Application\UseCases\Expense;

use App\Application\DTOs\ExpenseSearchDTO;
use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;

class ExportExpensesUseCase
{
    private const CSV_HEADERS = [
        '経費番号', 'タイトル', '申請者', '合計金額', '通貨', 'ステータス',
        '申請日', '承認日', 'カテゴリ', '明細説明', '明細金額', '利用日',
    ];

    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
    ) {}

    /**
     * @return iterable<array<string, string>>
     */
    public function execute(ExpenseSearchDTO $dto): iterable
    {
        yield self::CSV_HEADERS;

        $filters = array_filter([
            'status' => $dto->status,
            'applicant_id' => $dto->applicantId,
            'date_from' => $dto->dateFrom,
            'date_to' => $dto->dateTo,
        ], fn($v) => $v !== null);

        foreach ($this->expenseRepository->cursor($dto->tenantId, $filters) as $expense) {
            /** @var Expense $expense */
            foreach ($expense->getItems() as $item) {
                yield [
                    $expense->getExpenseNumber()->getValue(),
                    $expense->getTitle(),
                    $expense->getApplicantId(),
                    (string) $expense->getTotalAmount()->getAmount(),
                    $expense->getCurrency(),
                    $expense->getStatus()->getValue(),
                    $expense->getAppliedAt()?->format('Y-m-d') ?? '',
                    $expense->getApprovedAt()?->format('Y-m-d') ?? '',
                    $item->getCategoryId(),
                    $item->getDescription(),
                    (string) $item->getLineTotal()->getAmount(),
                    $item->getExpenseDate()->format('Y-m-d'),
                ];
            }
        }
    }
}
