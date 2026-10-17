<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Http\Controllers\Api\V1\ExpenseTrashController;
use Illuminate\Console\Command;

class PurgeExpenseTrash extends Command
{
    protected $signature   = 'expense:purge-trash';
    protected $description = '削除から30日超過した下書き経費を完全削除する';

    public function handle(): int
    {
        $this->info('Purging old expense trash...');
        ExpenseTrashController::purgeOldTrash();
        $this->info('Done.');
        return self::SUCCESS;
    }
}
