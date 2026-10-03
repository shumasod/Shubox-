<?php

namespace App\Console\Commands;

use App\Jobs\SendPendingApprovalReminder;
use App\Services\ApprovalPolicyService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DispatchApprovalReminders extends Command
{
    protected $signature   = 'expense:dispatch-reminders {--days=3 : Remind after this many days pending}';
    protected $description = 'Send reminder emails to approvers for expenses pending longer than --days';

    public function __construct(private readonly ApprovalPolicyService $policy)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $days = (int) $this->option('days');

        $pending = DB::table('expenses')
            ->whereIn('status', ['submitted', 'pending_approval'])
            ->where('updated_at', '<=', now()->subDays($days))
            ->select('id', 'tenant_id', 'applicant_id', 'updated_at')
            ->get();

        $count = 0;

        foreach ($pending as $row) {
            $expense = \App\Models\Expense::find($row->id);
            if (!$expense) continue;

            $approverId = $this->policy->nextApprover($expense);
            if (!$approverId) continue;

            $daysPending = (int) now()->diffInDays($row->updated_at);

            SendPendingApprovalReminder::dispatch(
                expenseId:   $row->id,
                approverId:  $approverId,
                daysPending: $daysPending,
            );

            $count++;
        }

        $this->info("Dispatched {$count} reminder(s) for expenses pending > {$days} days.");
        return self::SUCCESS;
    }
}
