<?php

namespace App\Console\Commands;

use App\Models\Expense;
use App\Models\RecurringExpense;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessRecurringExpenses extends Command
{
    protected $signature   = 'expenses:process-recurring {--dry-run : Preview without creating expenses}';
    protected $description = 'Create expense entries from due recurring schedules';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $due    = RecurringExpense::dueToday()->with('user')->get();

        $this->info("Found {$due->count()} recurring expense(s) due today.");

        $created = 0;
        $failed  = 0;

        foreach ($due as $recurring) {
            try {
                DB::transaction(function () use ($recurring, $dryRun, &$created) {
                    if (!$dryRun) {
                        Expense::create([
                            'tenant_id'   => $recurring->tenant_id,
                            'user_id'     => $recurring->user_id,
                            'title'       => $recurring->title,
                            'description' => $recurring->description,
                            'amount'      => $recurring->amount,
                            'currency'    => $recurring->currency,
                            'category_id' => $recurring->category_id,
                            'status'      => 'pending',
                            'expense_date' => now()->toDateString(),
                            'metadata'    => array_merge(
                                $recurring->metadata ?? [],
                                ['recurring_id' => $recurring->id]
                            ),
                        ]);

                        $recurring->advanceNextRunDate();
                        $recurring->save();
                    }
                    $created++;
                });

                $this->line(" ✓ [{$recurring->id}] {$recurring->title} ({$recurring->amount} {$recurring->currency})");
            } catch (\Throwable $e) {
                $failed++;
                Log::error('ProcessRecurringExpenses failed', [
                    'recurring_id' => $recurring->id,
                    'error'        => $e->getMessage(),
                ]);
                $this->error(" ✗ [{$recurring->id}] {$recurring->title}: {$e->getMessage()}");
            }
        }

        $this->info("{$created} expense(s) " . ($dryRun ? 'would be' : '') . " created. {$failed} failed.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
