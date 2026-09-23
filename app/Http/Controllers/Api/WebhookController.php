<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Events\WebhookReceived;
use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handlePaymentProvider(Request $request): JsonResponse
    {
        $payload = $request->json()->all();
        $event   = $payload['event'] ?? null;

        Log::info('Webhook received', ['event' => $event]);

        match ($event) {
            'payment.completed' => $this->markExpensePaid($payload),
            'payment.failed'    => $this->markExpensePaymentFailed($payload),
            default             => Log::warning('Unknown webhook event', ['event' => $event]),
        };

        return response()->json(['received' => true]);
    }

    private function markExpensePaid(array $payload): void
    {
        $expenseId = $payload['metadata']['expense_id'] ?? null;
        if (!$expenseId) {
            return;
        }

        Expense::where('id', $expenseId)
            ->where('status', 'approved')
            ->update(['status' => 'paid', 'paid_at' => now()]);
    }

    private function markExpensePaymentFailed(array $payload): void
    {
        $expenseId = $payload['metadata']['expense_id'] ?? null;
        if (!$expenseId) {
            return;
        }

        Expense::where('id', $expenseId)
            ->update(['payment_error' => $payload['error']['message'] ?? 'Unknown error']);
    private const SIGNATURE_HEADER = 'X-Webhook-Signature';
    private const TIMESTAMP_HEADER = 'X-Webhook-Timestamp';
    private const REPLAY_WINDOW_SECONDS = 300;

    public function receive(Request $request, string $endpointId): Response
    {
        $endpoint = WebhookEndpoint::where('public_id', $endpointId)
            ->where('is_active', true)
            ->firstOrFail();

        $rawBody = $request->getContent();

        if (! $this->verifySignature($request, $endpoint->secret, $rawBody)) {
            $this->logAttempt($endpoint, $rawBody, 'invalid_signature');
            return response('Forbidden', 403);
        }

        if (! $this->verifyTimestamp($request)) {
            $this->logAttempt($endpoint, $rawBody, 'replay_detected');
            return response('Request too old', 400);
        }

        $payload = json_decode($rawBody, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return response('Invalid JSON', 400);
        }

        $this->logAttempt($endpoint, $rawBody, 'accepted');

        event(new WebhookReceived(
            tenantId: $endpoint->tenant_id,
            endpointId: $endpoint->id,
            eventType: $payload['event'] ?? 'unknown',
            payload: $payload,
        ));

        return response('', 200);
    }

    private function verifySignature(Request $request, string $secret, string $rawBody): bool
    {
        $signature = $request->header(self::SIGNATURE_HEADER, '');
        $timestamp = $request->header(self::TIMESTAMP_HEADER, '');

        if (empty($signature) || empty($timestamp)) {
            return false;
        }

        $signedPayload = $timestamp . '.' . $rawBody;
        $expected = 'sha256=' . hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expected, $signature);
    }

    private function verifyTimestamp(Request $request): bool
    {
        $timestamp = (int) $request->header(self::TIMESTAMP_HEADER, 0);

        if ($timestamp === 0) {
            return false;
        }

        return abs(time() - $timestamp) <= self::REPLAY_WINDOW_SECONDS;
    }

    private function logAttempt(WebhookEndpoint $endpoint, string $rawBody, string $status): void
    {
        try {
            WebhookLog::create([
                'webhook_endpoint_id' => $endpoint->id,
                'tenant_id' => $endpoint->tenant_id,
                'payload' => $rawBody,
                'status' => $status,
                'received_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to log webhook attempt', ['error' => $e->getMessage()]);
        }
    }
}
