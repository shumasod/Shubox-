<?php

namespace Tests\Feature;

use Tests\TestCase;

class WebhookSignatureTest extends TestCase
{
    private string $secret = 'test-webhook-secret';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.webhooks.payment_secret' => $this->secret]);
    }

    public function test_valid_signature_passes(): void
    {
        $payload   = json_encode(['event' => 'payment.completed', 'metadata' => ['expense_id' => 1]]);
        $signature = 'sha256=' . hash_hmac('sha256', $payload, $this->secret);

        $response = $this->postJson(
            '/api/webhooks/payment',
            json_decode($payload, true),
            ['X-Webhook-Signature' => $signature]
        );

        $response->assertStatus(200);
    }

    public function test_missing_signature_returns_401(): void
    {
        $this->postJson('/api/webhooks/payment', [])
            ->assertStatus(401);
    }

    public function test_invalid_signature_returns_403(): void
    {
        $this->postJson(
            '/api/webhooks/payment',
            [],
            ['X-Webhook-Signature' => 'sha256=invalidsig']
        )->assertStatus(403);
    }

    public function test_stale_timestamp_returns_403(): void
    {
        $payload   = json_encode(['event' => 'ping']);
        $signature = 'sha256=' . hash_hmac('sha256', $payload, $this->secret);
        $stale     = time() - 600;

        $this->postJson(
            '/api/webhooks/payment',
            json_decode($payload, true),
            [
                'X-Webhook-Signature' => $signature,
                'X-Webhook-Timestamp' => (string) $stale,
            ]
        )->assertStatus(403);
    }
}
