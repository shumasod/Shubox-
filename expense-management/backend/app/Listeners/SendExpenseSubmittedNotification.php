<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ExpenseSubmitted;
use App\Infrastructure\Persistence\Eloquent\Models\ApprovalFlowModel;
use App\Infrastructure\Persistence\Eloquent\Models\NotificationModel;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Str;

class SendExpenseSubmittedNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(ExpenseSubmitted $event): void
    {
        $expense  = $event->expense;
        $tenantId = $expense->tenant_id;

        $flow = ApprovalFlowModel::with('steps')
            ->where('tenant_id', $tenantId)
            ->where('is_default', true)
            ->first();

        if (!$flow || $flow->steps->isEmpty()) {
            return;
        }

        $firstStep   = $flow->steps->sortBy('step_number')->first();
        $approverIds = $firstStep->approver_ids ?? [];

        foreach ($approverIds as $approverId) {
            $approver = UserModel::find($approverId);
            if (!$approver || !$approver->is_active) {
                continue;
            }

            NotificationModel::create([
                'id'        => Str::uuid()->toString(),
                'user_id'   => $approverId,
                'type'      => 'expense_submitted',
                'title'     => '経費申請の承認依頼',
                'body'      => "「{$expense->title}」の承認をお願いします。",
                'data'      => json_encode(['expense_id' => $expense->id]),
                'read_at'   => null,
            ]);
        }
    }
}
