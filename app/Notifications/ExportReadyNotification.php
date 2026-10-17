<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExportReadyNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $downloadUrl) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your expense export is ready')
            ->line('Your CSV export has been generated successfully.')
            ->action('Download CSV', $this->downloadUrl)
            ->line('This link will expire in 60 minutes.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'export_ready',
            'download_url' => $this->downloadUrl,
        ];
    }
}
