<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SlackNotificationService
{
    public function __construct(
        private readonly string $webhookUrl,
        private readonly string $appUrl,
    ) {}

    public function notifyApprovalRequired(Expense $expense, User $approver): void
    {
        $amount = number_format($expense->amount) . ' ' . $expense->currency;
        $url    = "{$this->appUrl}/expenses/{$expense->id}";

        $this->send([
            'text' => "*承認リクエスト* — {$expense->user->name} からの経費申請",
            'blocks' => [
                [
                    'type' => 'section',
                    'text' => [
                        'type' => 'mrkdwn',
                        'text' => "*承認必要:* <{$url}|{$expense->title}>",
                    ],
                    'fields' => [
                        ['type' => 'mrkdwn', 'text' => "*申請者:*\n{$expense->user->name}"],
                        ['type' => 'mrkdwn', 'text' => "*金額:*\n{$amount}"],
                        ['type' => 'mrkdwn', 'text' => "*日付:*\n{$expense->expense_date}"],
                        ['type' => 'mrkdwn', 'text' => "*承認者:*\n{$approver->name}"],
                    ],
                ],
                [
                    'type' => 'actions',
                    'elements' => [
                        [
                            'type' => 'button',
                            'text' => ['type' => 'plain_text', 'text' => '承認する'],
                            'style' => 'primary',
                            'url'   => $url,
                        ],
                    ],
                ],
            ],
        ]);
    }

    public function notifyApproved(Expense $expense, User $approver): void
    {
        $amount = number_format($expense->amount) . ' ' . $expense->currency;
        $url    = "{$this->appUrl}/expenses/{$expense->id}";

        $this->send([
            'text' => ":white_check_mark: *経費承認済* — {$expense->title}",
            'blocks' => [
                [
                    'type' => 'section',
                    'text' => [
                        'type' => 'mrkdwn',
                        'text' => ":white_check_mark: <{$url}|{$expense->title}> が *{$approver->name}* によって承認されました。\n金額: *{$amount}*",
                    ],
                ],
            ],
        ]);
    }

    public function notifyRejected(Expense $expense, User $rejector, ?string $comment): void
    {
        $url = "{$this->appUrl}/expenses/{$expense->id}";

        $this->send([
            'text' => ":x: *経費却下* — {$expense->title}",
            'blocks' => [
                [
                    'type' => 'section',
                    'text' => [
                        'type' => 'mrkdwn',
                        'text' => ":x: <{$url}|{$expense->title}> が *{$rejector->name}* によって却下されました。" .
                            ($comment ? "\n> {$comment}" : ''),
                    ],
                ],
            ],
        ]);
    }

    public function notifyPaid(Expense $expense): void
    {
        $amount = number_format($expense->amount) . ' ' . $expense->currency;
        $url    = "{$this->appUrl}/expenses/{$expense->id}";

        $this->send([
            'text' => ":money_with_wings: *支払済* — {$expense->title} ({$amount})",
            'blocks' => [
                [
                    'type' => 'section',
                    'text' => [
                        'type' => 'mrkdwn',
                        'text' => ":money_with_wings: <{$url}|{$expense->title}> の支払いが完了しました。\n金額: *{$amount}*",
                    ],
                ],
            ],
        ]);
    }

    private function send(array $payload): void
    {
        if (empty($this->webhookUrl)) {
            Log::debug('Slack webhook URL not configured; skipping notification.');
            return;
        }

        try {
            $response = Http::timeout(5)->post($this->webhookUrl, $payload);
            if (!$response->successful()) {
                Log::warning('Slack notification failed', ['status' => $response->status(), 'body' => $response->body()]);
            }
        } catch (\Throwable $e) {
            Log::error('Slack notification exception', ['error' => $e->getMessage()]);
        }
    }
}
