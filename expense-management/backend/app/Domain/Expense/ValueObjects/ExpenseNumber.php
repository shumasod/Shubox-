<?php

declare(strict_types=1);

namespace App\Domain\Expense\ValueObjects;

use InvalidArgumentException;

final class ExpenseNumber
{
    private readonly string $value;

    private function __construct(string $value)
    {
        if (!preg_match('/^EXP-\d{4}-\d{6}$/', $value)) {
            throw new InvalidArgumentException("Invalid expense number format: {$value}");
        }
        $this->value = $value;
    }

    /**
     * シーケンス番号から採番
     * フォーマット: EXP-{年月}-{連番6桁}
     */
    public static function generate(string $yearMonth, int $sequence): self
    {
        if (!preg_match('/^\d{4}$/', $yearMonth)) {
            throw new InvalidArgumentException("Invalid yearMonth format: {$yearMonth}. Expected YYMM.");
        }
        if ($sequence < 1 || $sequence > 999999) {
            throw new InvalidArgumentException("Sequence must be between 1 and 999999.");
        }

        return new self(sprintf('EXP-%s-%06d', $yearMonth, $sequence));
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
