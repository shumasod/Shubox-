<?php

declare(strict_types=1);

namespace App\Events;

use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExpenseRejected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ExpenseModel $expense,
        public readonly string $reason,
    ) {}
}
