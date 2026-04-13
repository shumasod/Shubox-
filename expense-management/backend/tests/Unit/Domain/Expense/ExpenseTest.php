<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Expense;

use App\Domain\Expense\Entities\Expense;
use App\Domain\Expense\Entities\ExpenseItem;
use App\Domain\Expense\ValueObjects\ExpenseNumber;
use App\Domain\Expense\ValueObjects\ExpenseStatus;
use App\Domain\Shared\ValueObjects\Money;
use DateTimeImmutable;
use DomainException;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExpenseTest extends TestCase
{
    private function makeExpense(string $title = 'テスト経費'): Expense
    {
        return Expense::create(
            id: 'exp-001',
            tenantId: 'tenant-001',
            applicantId: 'user-001',
            expenseNumber: ExpenseNumber::generate('2401', 1),
            title: $title,
        );
    }

    private function makeItem(string $expenseId = 'exp-001'): ExpenseItem
    {
        return ExpenseItem::create(
            id: 'item-001',
            expenseId: $expenseId,
            categoryId: 'cat-001',
            description: '新幹線代',
            amount: Money::of(14060),
            expenseDate: new DateTimeImmutable('2024-01-15'),
        );
    }

    public function test_creates_expense_in_draft_status(): void
    {
        $expense = $this->makeExpense();

        $this->assertSame('draft', $expense->getStatus()->getValue());
        $this->assertSame('tenant-001', $expense->getTenantId());
        $this->assertSame('user-001', $expense->getApplicantId());
        $this->assertEmpty($expense->getItems());
    }

    public function test_throws_on_empty_title(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->makeExpense('');
    }

    public function test_throws_on_title_too_long(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->makeExpense(str_repeat('a', 201));
    }

    public function test_adds_item_to_draft_expense(): void
    {
        $expense = $this->makeExpense();
        $item = $this->makeItem();
        $expense->addItem($item);

        $this->assertCount(1, $expense->getItems());
    }

    public function test_cannot_add_item_to_submitted_expense(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Cannot add items to non-editable expense.');
        $expense->addItem($this->makeItem('exp-001'));
    }

    public function test_calculates_total_amount(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem(ExpenseItem::create(
            id: 'item-001', expenseId: 'exp-001', categoryId: 'cat-001',
            description: '交通費', amount: Money::of(14060),
            expenseDate: new DateTimeImmutable('2024-01-15'),
        ));
        $expense->addItem(ExpenseItem::create(
            id: 'item-002', expenseId: 'exp-001', categoryId: 'cat-002',
            description: '宿泊費', amount: Money::of(12000),
            expenseDate: new DateTimeImmutable('2024-01-15'),
        ));

        $this->assertSame(26060, $expense->getTotalAmount()->getAmount());
    }

    public function test_submit_transitions_to_pending(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();

        $this->assertTrue($expense->getStatus()->isPending());
        $this->assertNotNull($expense->getAppliedAt());
        $this->assertSame(1, $expense->getCurrentStep());
    }

    public function test_cannot_submit_without_items(): void
    {
        $expense = $this->makeExpense();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Cannot submit expense without items.');
        $expense->submit();
    }

    public function test_cannot_submit_already_pending_expense(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();

        $this->expectException(DomainException::class);
        $expense->submit();
    }

    public function test_approve_records_approval(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();
        $expense->approve('approver-001', 1, '承認します');

        $records = $expense->getApprovalRecords();
        $this->assertCount(1, $records);
        $this->assertSame('approved', $records[0]->getAction());
        $this->assertSame('承認します', $records[0]->getComment());
    }

    public function test_fully_approve_changes_status(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();
        $expense->approve('approver-001', 1);
        $expense->fullyApprove();

        $this->assertTrue($expense->getStatus()->isApproved());
        $this->assertNotNull($expense->getApprovedAt());
    }

    public function test_reject_requires_comment(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Rejection comment is required.');
        $expense->reject('approver-001', 1, '');
    }

    public function test_reject_transitions_to_rejected(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();
        $expense->reject('approver-001', 1, '証憑が不十分です。');

        $this->assertTrue($expense->getStatus()->isRejected());
        $records = $expense->getApprovalRecords();
        $this->assertSame('rejected', $records[0]->getAction());
    }

    public function test_cancel_by_applicant(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();
        $expense->cancel('user-001');

        $this->assertTrue($expense->getStatus()->isCancelled());
    }

    public function test_cancel_by_non_applicant_throws(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Only the applicant can cancel the expense.');
        $expense->cancel('user-999');
    }

    public function test_cannot_cancel_approved_expense(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();
        $expense->approve('approver-001', 1);
        $expense->fullyApprove();

        $this->expectException(DomainException::class);
        $expense->cancel('user-001');
    }

    public function test_mark_as_paid(): void
    {
        $expense = $this->makeExpense();
        $expense->addItem($this->makeItem());
        $expense->submit();
        $expense->approve('approver-001', 1);
        $expense->fullyApprove();
        $expense->markAsPaid();

        $this->assertTrue($expense->getStatus()->isPaid());
    }
}
