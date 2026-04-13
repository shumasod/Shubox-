<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Shared;

use App\Domain\Shared\ValueObjects\Money;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_creates_money_with_valid_amount(): void
    {
        $money = Money::of(1000);
        $this->assertSame(1000, $money->getAmount());
        $this->assertSame('JPY', $money->getCurrency());
    }

    public function test_creates_money_with_currency(): void
    {
        $money = Money::of(500, 'USD');
        $this->assertSame(500, $money->getAmount());
        $this->assertSame('USD', $money->getCurrency());
    }

    public function test_throws_on_negative_amount(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Amount must be non-negative.');
        Money::of(-1);
    }

    public function test_throws_on_unsupported_currency(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unsupported currency: CNY');
        Money::of(100, 'CNY');
    }

    public function test_add_two_money_values(): void
    {
        $a = Money::of(1000);
        $b = Money::of(500);
        $result = $a->add($b);

        $this->assertSame(1500, $result->getAmount());
    }

    public function test_add_throws_on_currency_mismatch(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Currency mismatch');
        Money::of(100)->add(Money::of(100, 'USD'));
    }

    public function test_subtract_money(): void
    {
        $result = Money::of(1000)->subtract(Money::of(300));
        $this->assertSame(700, $result->getAmount());
    }

    public function test_subtract_throws_on_negative_result(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Result would be negative.');
        Money::of(100)->subtract(Money::of(200));
    }

    public function test_is_greater_than(): void
    {
        $this->assertTrue(Money::of(1000)->isGreaterThan(Money::of(999)));
        $this->assertFalse(Money::of(999)->isGreaterThan(Money::of(1000)));
    }

    public function test_equals(): void
    {
        $this->assertTrue(Money::of(1000)->equals(Money::of(1000)));
        $this->assertFalse(Money::of(1000)->equals(Money::of(1001)));
        $this->assertFalse(Money::of(1000)->equals(Money::of(1000, 'USD')));
    }

    public function test_format_jpy(): void
    {
        $this->assertSame('¥1,000', Money::of(1000)->format());
        $this->assertSame('¥0', Money::of(0)->format());
    }

    public function test_zero_amount_is_valid(): void
    {
        $money = Money::of(0);
        $this->assertSame(0, $money->getAmount());
    }
}
