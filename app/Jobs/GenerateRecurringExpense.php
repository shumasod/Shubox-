<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\RecurringExpenseTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class GenerateRecurringExpense implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(private readonly RecurringExpenseTemplate $template) {}

    public function handle(): void
    {
        DB::transaction(function () {
            Expense::create([
                'tenant_id'   => $this->template->tenant_id,
                'user_id'     => $this->template->user_id,
                'category_id' => $this->template->category_id,
                'title'       => $this->template->title,
                'description' => $this->template->description,
                'amount'      => $this->template->amount,
                'currency'    => $this->template->currency,
                'status'      => 'draft',
                'expense_date'=> now()->toDateString(),
                'metadata'    => array_merge(
                    $this->template->metadata ?? [],
                    ['generated_from_template_id' => $this->template->id]
                ),
            ]);

            $this->template->update([
                'last_run_date' => now()->toDateString(),
                'next_run_date' => $this->template->calculateNextRunDate()->toDateString(),
            ]);
        });
    }
}
