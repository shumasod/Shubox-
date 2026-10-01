<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExpenseExportReady extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $exportId,
        private readonly string $downloadUrl,
        private readonly Carbon $expiresAt,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('経費データのエクスポートが完了しました')
            ->line('リクエストした経費データのエクスポートが完了しました。')
            ->action('CSVをダウンロード', $this->downloadUrl)
            ->line("リンクの有効期限: {$this->expiresAt->toDateTimeString()}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'expense_export_ready',
            'export_id'    => $this->exportId,
            'download_url' => $this->downloadUrl,
            'expires_at'   => $this->expiresAt->toIso8601String(),
        ];
    }
}
