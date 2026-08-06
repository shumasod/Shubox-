<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendApprovalRequestEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int    $tries       = 3;
    public int    $backoff     = 60;
    public string $queue       = 'emails';

    public function __construct(
        private readonly string $expenseId,
        private readonly string $approverUserId,
    ) {}

    public function handle(): void
    {
        $expense  = ExpenseModel::with('applicant')->find($this->expenseId);
        $approver = UserModel::find($this->approverUserId);

        if (!$expense || !$approver) {
            Log::warning('SendApprovalRequestEmail: expense or approver not found', [
                'expense_id'  => $this->expenseId,
                'approver_id' => $this->approverUserId,
            ]);
            return;
        }

        Mail::send([], [], function ($message) use ($expense, $approver) {
            $message
                ->to($approver->email, $approver->name)
                ->subject("「{$expense->title}」の承認依頼")
                ->html($this->buildHtml($expense, $approver));
        });
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendApprovalRequestEmail failed', [
            'expense_id'  => $this->expenseId,
            'approver_id' => $this->approverUserId,
            'error'       => $e->getMessage(),
        ]);
    }

    private function buildHtml(ExpenseModel $expense, UserModel $approver): string
    {
        $appUrl     = config('app.url');
        $detailUrl  = "{$appUrl}/expenses/{$expense->id}";
        $amount     = number_format($expense->total_amount);
        $applicant  = $expense->applicant?->name ?? '-';

        return <<<HTML
        <!DOCTYPE html>
        <html lang="ja">
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; color: #111;">
          <p>{$approver->name} 様</p>
          <p>以下の経費申請の承認をお願いします。</p>
          <table border="0" cellpadding="8" style="border-collapse: collapse; margin: 16px 0;">
            <tr><th style="text-align:left">件名</th><td>{$expense->title}</td></tr>
            <tr><th style="text-align:left">申請者</th><td>{$applicant}</td></tr>
            <tr><th style="text-align:left">金額</th><td>&yen;{$amount}</td></tr>
          </table>
          <p><a href="{$detailUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">経費申請を確認する</a></p>
        </body>
        </html>
        HTML;
    }
}
