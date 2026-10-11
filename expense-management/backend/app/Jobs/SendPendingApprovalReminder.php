<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class SendPendingApprovalReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 300;

    public function __construct(
        private readonly int $expenseId,
        private readonly int $approverId,
        private readonly int $daysPending,
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $expense  = Expense::with('applicant')->find($this->expenseId);
        $approver = User::find($this->approverId);

        if (!$expense || !$approver) {
            return;
        }

        // Skip if already approved/rejected since the job was dispatched
        if (!in_array($expense->status, ['submitted', 'pending_approval'], true)) {
            return;
        }

        $approver->notify(new \App\Notifications\PendingApprovalReminder(
            expense: $expense,
            daysPending: $this->daysPending,
        ));
    }
}
