<?php

declare(strict_types=1);

namespace App\Application\UseCases\Expense;

use App\Application\DTOs\CreateExpenseDTO;
use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Entities\ExpenseItem;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use App\Domain\Expense\ValueObjects\ExpenseNumber;
use App\Domain\Shared\ValueObjects\Money;
use DateTimeImmutable;
use Illuminate\Support\Str;

class CreateExpenseUseCase
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
    ) {}

    public function execute(CreateExpenseDTO $dto): Expense
    {
        $yearMonth = (new DateTimeImmutable())->format('ym');
        $sequence = $this->expenseRepository->nextSequence($dto->tenantId, $yearMonth);
        $expenseNumber = ExpenseNumber::generate($yearMonth, $sequence);

        $expense = Expense::create(
            id: Str::uuid()->toString(),
            tenantId: $dto->tenantId,
            applicantId: $dto->applicantId,
            expenseNumber: $expenseNumber,
            title: $dto->title,
            description: $dto->description,
            currency: $dto->currency,
        );

        foreach ($dto->items as $index => $itemDto) {
            $item = ExpenseItem::create(
                id: Str::uuid()->toString(),
                expenseId: $expense->getId(),
                categoryId: $itemDto->categoryId,
                description: $itemDto->description,
                amount: Money::of($itemDto->amount, $dto->currency),
                expenseDate: new DateTimeImmutable($itemDto->expenseDate),
                quantity: $itemDto->quantity,
                vendor: $itemDto->vendor,
                purpose: $itemDto->purpose,
                sortOrder: $itemDto->sortOrder ?: $index,
            );
            $expense->addItem($item);
        }

        $this->expenseRepository->save($expense);

        return $expense;
    }
}
