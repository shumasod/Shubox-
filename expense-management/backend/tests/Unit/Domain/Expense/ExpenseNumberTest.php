<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Expense;

use App\Domain\Expense\ValueObjects\ExpenseNumber;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExpenseNumberTest extends TestCase
{
    public function test_generates_valid_expense_number(): void
    {
        $number = ExpenseNumber::generate('2401', 1);
        $this->assertSame('EXP-2401-000001', $number->getValue());
    }

    public function test_generates_with_large_sequence(): void
    {
        $number = ExpenseNumber::generate('2412', 999999);
        $this->assertSame('EXP-2412-999999', $number->getValue());
    }

    public function test_creates_from_string(): void
    {
        $number = ExpenseNumber::fromString('EXP-2401-000001');
        $this->assertSame('EXP-2401-000001', $number->getValue());
    }

    public function test_throws_on_invalid_format(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ExpenseNumber::fromString('INVALID-FORMAT');
    }

    public function test_throws_on_invalid_year_month(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ExpenseNumber::generate('24011', 1); // 5桁
    }

    public function test_throws_on_zero_sequence(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ExpenseNumber::generate('2401', 0);
    }

    public function test_throws_on_overflow_sequence(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ExpenseNumber::generate('2401', 1000000);
    }

    public function test_equals(): void
    {
        $a = ExpenseNumber::fromString('EXP-2401-000001');
        $b = ExpenseNumber::fromString('EXP-2401-000001');
        $c = ExpenseNumber::fromString('EXP-2401-000002');

        $this->assertTrue($a->equals($b));
        $this->assertFalse($a->equals($c));
    }

    public function test_to_string(): void
    {
        $number = ExpenseNumber::generate('2401', 42);
        $this->assertSame('EXP-2401-000042', (string) $number);
    }
}
