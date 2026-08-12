<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ProcessRecurringExpenses extends Command
{
    protected $signature   = 'expenses:process-recurring {--date= : Date to process (YYYY-MM-DD, defaults to today)}';
    protected $description = 'Create new expense instances from recurring expense templates';

    public function handle(): int
    {
        $date = $this->option('date')
            ? Carbon::parse($this->option('date'))
            : today();

        $this->info("Processing recurring expenses due on or before {$date->toDateString()}");

        $templates = DB::table('expenses')
            ->whereNull('deleted_at')
            ->where('is_recurring', true)
            ->whereNull('recurring_parent_id') // only root templates
            ->where('next_recurrence_date', '<=', $date->toDateString())
            ->get();

        if ($templates->isEmpty()) {
            $this->info('No recurring expenses due.');
            return self::SUCCESS;
        }

        $created = 0;

        foreach ($templates as $template) {
            $now = now();

            // Create new expense instance
            $newId = DB::table('expenses')->insertGetId([
                'tenant_id'            => $template->tenant_id,
                'user_id'              => $template->user_id,
                'category_id'          => $template->category_id,
                'project_id'           => $template->project_id,
                'title'                => $template->title,
                'amount'               => $template->amount,
                'currency'             => $template->currency,
                'expense_date'         => $date->toDateString(),
                'description'          => $template->description,
                'status'               => 'draft',
                'is_recurring'         => false,
                'recurring_parent_id'  => $template->id,
                'created_at'           => $now,
                'updated_at'           => $now,
            ]);

            // Advance next_recurrence_date by 1 month
            DB::table('expenses')
                ->where('id', $template->id)
                ->update([
                    'next_recurrence_date' => Carbon::parse($template->next_recurrence_date)
                        ->addMonth()
                        ->toDateString(),
                    'updated_at' => $now,
                ]);

            $created++;
            $this->line("  ✓ Created expense #{$newId} from template #{$template->id} ({$template->title})");
        }

        $this->info("Created {$created} expense(s).");

        return self::SUCCESS;
    }
}
