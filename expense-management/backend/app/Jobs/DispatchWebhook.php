<?php

namespace App\Jobs;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class DispatchWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        private readonly int $webhookId,
        private readonly string $event,
        private readonly array $payload,
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $webhook = Webhook::find($this->webhookId);

        if (!$webhook || !$webhook->is_active) {
            return;
        }

        $body    = json_encode($this->payload, JSON_UNESCAPED_UNICODE);
        $sig     = hash_hmac('sha256', $body, $webhook->secret);
        $attempt = $this->attempts();

        $response = Http::timeout(10)
            ->withHeaders([
                'Content-Type'           => 'application/json',
                'X-Webhook-Event'        => $this->event,
                'X-Webhook-Signature'    => "sha256={$sig}",
                'X-Webhook-Delivery-Id'  => uniqid('wh_', true),
            ])
            ->post($webhook->url, $this->payload);

        $success = $response->successful();

        WebhookDelivery::create([
            'webhook_id'    => $webhook->id,
            'event'         => $this->event,
            'payload'       => $this->payload,
            'status_code'   => $response->status(),
            'success'       => $success,
            'response_body' => substr($response->body(), 0, 2000),
            'attempt'       => $attempt,
        ]);

        $webhook->update([
            'last_triggered_at' => now(),
            'failure_count'     => $success ? 0 : $webhook->failure_count + 1,
        ]);

        if (!$success) {
            $this->release($this->backoff * $attempt);
        }
    }
}
