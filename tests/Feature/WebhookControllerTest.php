<?php

namespace Tests\Feature;

use App\Events\WebhookReceived;
use App\Models\Tenant;
use App\Models\WebhookEndpoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class WebhookControllerTest extends TestCase
{
    use RefreshDatabase;

    private WebhookEndpoint $endpoint;
    private string $secret = 'test-webhook-secret-32-chars-long!';

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::factory()->create();
        $this->endpoint = WebhookEndpoint::factory()->create([
            'tenant_id' => $tenant->id,
            'secret' => $this->secret,
            'is_active' => true,
        ]);
    }

    public function test_accepts_valid_signed_webhook(): void
    {
        Event::fake();

        $payload = json_encode(['event' => 'expense.created', 'data' => ['id' => 1]]);
        $timestamp = (string) time();
        $signature = 'sha256=' . hash_hmac('sha256', $timestamp . '.' . $payload, $this->secret);

        $response = $this->postJson(
            "/api/webhooks/{$this->endpoint->public_id}",
            json_decode($payload, true),
            [
                'X-Webhook-Signature' => $signature,
                'X-Webhook-Timestamp' => $timestamp,
                'Content-Type' => 'application/json',
            ]
        );

        $response->assertStatus(200);
        Event::assertDispatched(WebhookReceived::class);
    }

    public function test_rejects_invalid_signature(): void
    {
        $response = $this->postJson(
            "/api/webhooks/{$this->endpoint->public_id}",
            ['event' => 'expense.created'],
            [
                'X-Webhook-Signature' => 'sha256=invalidsignature',
                'X-Webhook-Timestamp' => (string) time(),
            ]
        );

        $response->assertStatus(403);
    }

    public function test_rejects_replay_attack(): void
    {
        $payload = json_encode(['event' => 'expense.created']);
        $oldTimestamp = (string) (time() - 400);
        $signature = 'sha256=' . hash_hmac('sha256', $oldTimestamp . '.' . $payload, $this->secret);

        $response = $this->postJson(
            "/api/webhooks/{$this->endpoint->public_id}",
            json_decode($payload, true),
            [
                'X-Webhook-Signature' => $signature,
                'X-Webhook-Timestamp' => $oldTimestamp,
            ]
        );

        $response->assertStatus(400);
    }

    public function test_returns_404_for_inactive_endpoint(): void
    {
        $this->endpoint->update(['is_active' => false]);

        $response = $this->postJson("/api/webhooks/{$this->endpoint->public_id}");

        $response->assertStatus(404);
    }

    public function test_rejects_missing_signature_headers(): void
    {
        $response = $this->postJson(
            "/api/webhooks/{$this->endpoint->public_id}",
            ['event' => 'expense.created']
        );

        $response->assertStatus(403);
    }
}
