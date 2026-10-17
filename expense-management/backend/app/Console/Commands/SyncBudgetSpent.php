<?php

namespace App\Console\Commands;

use App\Models\Budget;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncBudgetSpent extends Command
{
    protected $signature   = 'budget:sync-spent';
    protected $description = 'Recalculate and update the spent amount for all active budgets';

    public function handle(): int
    {
        $updated = 0;

        Budget::chunk(200, function ($budgets) use (&$updated) {
            foreach ($budgets as $budget) {
                $spent = DB::table('expenses')
                    ->where('tenant_id', $budget->tenant_id)
                    ->where('status', 'approved')
                    ->when($budget->department_id, fn($q) => $q->where('department_id', $budget->department_id))
                    ->when($budget->category_id, fn($q) => $q->where('category_id', $budget->category_id))
                    ->whereYear('applied_at', $budget->fiscal_year)
                    ->sum('total_amount');

                if ($budget->spent !== (int) $spent) {
                    $budget->update(['spent' => (int) $spent]);
                    $updated++;
                }
            }
        });

        $this->info("Updated {$updated} budget records.");
        return self::SUCCESS;
    }
}
