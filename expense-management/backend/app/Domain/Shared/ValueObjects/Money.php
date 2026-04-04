<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObjects;

use InvalidArgumentException;

final class Money
{
    private readonly int $amount; // 金額（最小単位: 円）
    private readonly string $currency;

    public function __construct(int $amount, string $currency = 'JPY')
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount must be non-negative.');
        }
        if (!in_array($currency, ['JPY', 'USD', 'EUR'], true)) {
            throw new InvalidArgumentException("Unsupported currency: {$currency}");
        }

        $this->amount = $amount;
        $this->currency = $currency;
    }

    public static function of(int $amount, string $currency = 'JPY'): self
    {
        return new self($amount, $currency);
    }

    public function getAmount(): int
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function add(self $other): self
    {
        $this->assertSameCurrency($other);
        return new self($this->amount + $other->amount, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->assertSameCurrency($other);
        if ($this->amount < $other->amount) {
            throw new InvalidArgumentException('Result would be negative.');
        }
        return new self($this->amount - $other->amount, $this->currency);
    }

    public function isGreaterThan(self $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amount > $other->amount;
    }

    public function isLessThan(self $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amount < $other->amount;
    }

    public function equals(self $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function format(): string
    {
        return match ($this->currency) {
            'JPY' => '¥' . number_format($this->amount),
            'USD' => '$' . number_format($this->amount / 100, 2),
            'EUR' => '€' . number_format($this->amount / 100, 2),
            default => "{$this->currency} {$this->amount}",
        };
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Currency mismatch: {$this->currency} vs {$other->currency}"
            );
        }
    }
}
