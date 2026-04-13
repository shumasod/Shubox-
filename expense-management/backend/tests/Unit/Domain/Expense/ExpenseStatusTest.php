<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Expense;

use App\Domain\Expense\ValueObjects\ExpenseStatus;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExpenseStatusTest extends TestCase
{
    public function test_creates_draft_status(): void
    {
        $status = ExpenseStatus::draft();
        $this->assertSame('draft', $status->getValue());
        $this->assertTrue($status->isDraft());
    }

    public function test_creates_pending_status(): void
    {
        $status = ExpenseStatus::pending();
        $this->assertSame('pending', $status->getValue());
        $this->assertTrue($status->isPending());
    }

    public function test_throws_on_invalid_status(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid expense status: invalid');
        new ExpenseStatus('invalid');
    }

    /**
     * @dataProvider validTransitionsProvider
     */
    public function test_valid_transitions(string $from, string $to): void
    {
        $fromStatus = new ExpenseStatus($from);
        $toStatus = new ExpenseStatus($to);

        $this->assertTrue($fromStatus->canTransitionTo($toStatus));
        $result = $fromStatus->transitionTo($toStatus);
        $this->assertSame($to, $result->getValue());
    }

    public static function validTransitionsProvider(): array
    {
        return [
            ['draft', 'pending'],
            ['draft', 'cancelled'],
            ['pending', 'approved'],
            ['pending', 'rejected'],
            ['pending', 'cancelled'],
            ['pending', 'partially_approved'],
            ['partially_approved', 'approved'],
            ['partially_approved', 'rejected'],
            ['approved', 'paid'],
            ['rejected', 'draft'],
        ];
    }

    /**
     * @dataProvider invalidTransitionsProvider
     */
    public function test_invalid_transitions(string $from, string $to): void
    {
        $fromStatus = new ExpenseStatus($from);
        $toStatus = new ExpenseStatus($to);

        $this->assertFalse($fromStatus->canTransitionTo($toStatus));
    }

    public static function invalidTransitionsProvider(): array
    {
        return [
            ['draft', 'approved'],
            ['draft', 'rejected'],
            ['approved', 'draft'],
            ['approved', 'rejected'],
            ['paid', 'approved'],
            ['paid', 'draft'],
            ['cancelled', 'draft'],
        ];
    }

    public function test_transition_throws_on_invalid(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage("Cannot transition from 'approved' to 'draft'");
        $approved = new ExpenseStatus('approved');
        $approved->transitionTo(ExpenseStatus::draft());
    }

    public function test_is_editable_only_for_draft_and_rejected(): void
    {
        $this->assertTrue(ExpenseStatus::draft()->isEditable());
        $this->assertTrue((new ExpenseStatus('rejected'))->isEditable());

        foreach (['pending', 'partially_approved', 'approved', 'cancelled', 'paid'] as $status) {
            $this->assertFalse((new ExpenseStatus($status))->isEditable(), "{$status} should not be editable");
        }
    }

    public function test_equals(): void
    {
        $this->assertTrue(ExpenseStatus::draft()->equals(ExpenseStatus::draft()));
        $this->assertFalse(ExpenseStatus::draft()->equals(ExpenseStatus::pending()));
    }

    public function test_to_string(): void
    {
        $this->assertSame('draft', (string) ExpenseStatus::draft());
    }
}
