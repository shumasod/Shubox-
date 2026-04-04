<?php

declare(strict_types=1);

namespace Tests\Unit\Application;

use App\Application\DTOs\CreateExpenseDTO;
use App\Application\DTOs\ExpenseItemDTO;
use App\Application\UseCases\Expense\CreateExpenseUseCase;
use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class CreateExpenseUseCaseTest extends TestCase
{
    private ExpenseRepositoryInterface&MockObject $expenseRepository;
    private CreateExpenseUseCase $useCase;

    protected function setUp(): void
    {
        $this->expenseRepository = $this->createMock(ExpenseRepositoryInterface::class);
        $this->useCase = new CreateExpenseUseCase($this->expenseRepository);
    }

    public function test_creates_expense_with_items(): void
    {
        $this->expenseRepository
            ->expects($this->once())
            ->method('nextSequence')
            ->willReturn(1);

        $this->expenseRepository
            ->expects($this->once())
            ->method('save')
            ->with($this->isInstanceOf(Expense::class));

        $dto = new CreateExpenseDTO(
            tenantId: 'tenant-001',
            applicantId: 'user-001',
            title: '大阪出張費',
            description: '出張交通費・宿泊費',
            currency: 'JPY',
            items: [
                new ExpenseItemDTO(
                    categoryId: 'cat-001',
                    description: '新幹線代',
                    amount: 14060,
                    expenseDate: '2024-01-15',
                    quantity: 1,
                ),
                new ExpenseItemDTO(
                    categoryId: 'cat-002',
                    description: '宿泊費',
                    amount: 12000,
                    expenseDate: '2024-01-15',
                ),
            ],
        );

        $expense = $this->useCase->execute($dto);

        $this->assertInstanceOf(Expense::class, $expense);
        $this->assertSame('大阪出張費', $expense->getTitle());
        $this->assertSame('tenant-001', $expense->getTenantId());
        $this->assertSame('user-001', $expense->getApplicantId());
        $this->assertCount(2, $expense->getItems());
        $this->assertSame('draft', $expense->getStatus()->getValue());
        $this->assertSame(26060, $expense->getTotalAmount()->getAmount());
    }

    public function test_generates_expense_number(): void
    {
        $this->expenseRepository
            ->method('nextSequence')
            ->willReturn(5);

        $this->expenseRepository->method('save');

        $dto = new CreateExpenseDTO(
            tenantId: 'tenant-001',
            applicantId: 'user-001',
            title: 'テスト経費',
            description: null,
            currency: 'JPY',
            items: [
                new ExpenseItemDTO(
                    categoryId: 'cat-001',
                    description: 'テスト',
                    amount: 1000,
                    expenseDate: date('Y-m-d'),
                ),
            ],
        );

        $expense = $this->useCase->execute($dto);

        $expenseNumber = $expense->getExpenseNumber()->getValue();
        $this->assertMatchesRegularExpression('/^EXP-\d{4}-000005$/', $expenseNumber);
    }

    public function test_saves_expense_to_repository(): void
    {
        $this->expenseRepository->method('nextSequence')->willReturn(1);

        $savedExpense = null;
        $this->expenseRepository
            ->expects($this->once())
            ->method('save')
            ->willReturnCallback(function (Expense $expense) use (&$savedExpense) {
                $savedExpense = $expense;
            });

        $dto = new CreateExpenseDTO(
            tenantId: 'tenant-001',
            applicantId: 'user-001',
            title: 'テスト経費',
            description: null,
            currency: 'JPY',
            items: [
                new ExpenseItemDTO(
                    categoryId: 'cat-001',
                    description: '交通費',
                    amount: 500,
                    expenseDate: date('Y-m-d'),
                ),
            ],
        );

        $this->useCase->execute($dto);

        $this->assertNotNull($savedExpense);
        $this->assertSame('tenant-001', $savedExpense->getTenantId());
    }

    public function test_items_have_correct_sort_order(): void
    {
        $this->expenseRepository->method('nextSequence')->willReturn(1);
        $this->expenseRepository->method('save');

        $dto = new CreateExpenseDTO(
            tenantId: 'tenant-001',
            applicantId: 'user-001',
            title: 'テスト',
            description: null,
            currency: 'JPY',
            items: [
                new ExpenseItemDTO(categoryId: 'cat-001', description: '1つ目', amount: 100, expenseDate: date('Y-m-d')),
                new ExpenseItemDTO(categoryId: 'cat-001', description: '2つ目', amount: 200, expenseDate: date('Y-m-d')),
                new ExpenseItemDTO(categoryId: 'cat-001', description: '3つ目', amount: 300, expenseDate: date('Y-m-d')),
            ],
        );

        $expense = $this->useCase->execute($dto);
        $items = $expense->getItems();

        $this->assertSame(0, $items[0]->getSortOrder());
        $this->assertSame(1, $items[1]->getSortOrder());
        $this->assertSame(2, $items[2]->getSortOrder());
    }
}
