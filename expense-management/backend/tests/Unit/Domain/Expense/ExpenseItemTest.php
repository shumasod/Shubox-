<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Expense;

use App\Domain\Expense\Entities\ExpenseItem;
use App\Domain\Shared\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExpenseItemTest extends TestCase
{
    public function test_creates_expense_item(): void
    {
        $item = ExpenseItem::create(
            id: 'item-001',
            expenseId: 'exp-001',
            categoryId: 'cat-001',
            description: '新幹線代',
            amount: Money::of(14060),
            expenseDate: new DateTimeImmutable('2024-01-15'),
            quantity: 2,
        );

        $this->assertSame('item-001', $item->getId());
        $this->assertSame('exp-001', $item->getExpenseId());
        $this->assertSame(14060, $item->getAmount()->getAmount());
        $this->assertSame(2, $item->getQuantity());
    }

    public function test_throws_on_empty_description(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ExpenseItem::create(
            id: 'item-001',
            expenseId: 'exp-001',
            categoryId: 'cat-001',
            description: '',
            amount: Money::of(1000),
            expenseDate: new DateTimeImmutable(),
        );
    }

    public function test_throws_on_zero_quantity(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ExpenseItem::create(
            id: 'item-001',
            expenseId: 'exp-001',
            categoryId: 'cat-001',
            description: 'テスト',
            amount: Money::of(1000),
            expenseDate: new DateTimeImmutable(),
            quantity: 0,
        );
    }

    public function test_calculates_line_total(): void
    {
        $item = ExpenseItem::create(
            id: 'item-001',
            expenseId: 'exp-001',
            categoryId: 'cat-001',
            description: 'テスト',
            amount: Money::of(1000),
            expenseDate: new DateTimeImmutable(),
            quantity: 3,
        );

        $this->assertSame(3000, $item->getLineTotal()->getAmount());
    }

    public function test_line_total_equals_amount_for_single_quantity(): void
    {
        $item = ExpenseItem::create(
            id: 'item-001',
            expenseId: 'exp-001',
            categoryId: 'cat-001',
            description: 'テスト',
            amount: Money::of(5000),
            expenseDate: new DateTimeImmutable(),
        );

        $this->assertSame(5000, $item->getLineTotal()->getAmount());
    }
}
