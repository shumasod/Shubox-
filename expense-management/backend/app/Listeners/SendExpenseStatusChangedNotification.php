<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ExpenseApproved;
use App\Events\ExpenseRejected;
use App\Infrastructure\Persistence\Eloquent\Models\NotificationModel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Str;

class SendExpenseStatusChangedNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handleApproved(ExpenseApproved $event): void
    {
        $expense = $event->expense;
        $title   = $event->isFullyApproved ? '経費申請が承認されました' : '承認ステップを通過しました';
        $body    = $event->isFullyApproved
            ? "「{$expense->title}」が全ての承認ステップを通過しました。"
            : "「{$expense->title}」の承認ステップが完了しました。";

        $this->notify($expense->applicant_id, 'expense_approved', $title, $body, $expense->id);
    }

    public function handleRejected(ExpenseRejected $event): void
    {
        $expense = $event->expense;
        $this->notify(
            $expense->applicant_id,
            'expense_rejected',
            '経費申請が却下されました',
            "「{$expense->title}」が却下されました。理由: {$event->reason}",
            $expense->id,
        );
    }

    private function notify(string $userId, string $type, string $title, string $body, string $expenseId): void
    {
        NotificationModel::create([
            'id'      => Str::uuid()->toString(),
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'data'    => json_encode(['expense_id' => $expenseId]),
            'read_at' => null,
        ]);
    }
}
