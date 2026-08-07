<?php

namespace App\Http\Controllers\Api;

use App\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    private const ALLOWED_EVENTS = [
        'expense.created', 'expense.submitted', 'expense.approved',
        'expense.rejected', 'expense.paid', 'approval.requested',
    ];

    public function index(): JsonResponse
    {
        $webhooks = Webhook::where('tenant_id', Auth::user()->tenant_id)
            ->orderBy('name')
            ->get(['id', 'name', 'url', 'events', 'is_active', 'last_triggered_at', 'last_status']);

        return response()->json($webhooks);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'url'             => 'required|url|max:500',
            'events'          => 'required|array|min:1',
            'events.*'        => 'string|in:' . implode(',', self::ALLOWED_EVENTS),
            'timeout_seconds' => 'nullable|integer|between:5,30',
            'retry_count'     => 'nullable|integer|between:0,5',
        ]);

        $webhook = Webhook::create([
            ...$validated,
            'tenant_id'       => Auth::user()->tenant_id,
            'secret'          => Str::random(40),
            'timeout_seconds' => $validated['timeout_seconds'] ?? 10,
            'retry_count'     => $validated['retry_count'] ?? 3,
        ]);

        // Return secret only at creation time
        return response()->json([
            'id'     => $webhook->id,
            'secret' => $webhook->secret,
        ] + $webhook->makeVisible('secret')->toArray(), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $webhook = Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:100',
            'url'             => 'sometimes|url|max:500',
            'events'          => 'sometimes|array|min:1',
            'events.*'        => 'string|in:' . implode(',', self::ALLOWED_EVENTS),
            'is_active'       => 'sometimes|boolean',
            'timeout_seconds' => 'sometimes|integer|between:5,30',
            'retry_count'     => 'sometimes|integer|between:0,5',
        ]);

        $webhook->update($validated);

        return response()->json($webhook);
    }

    public function destroy(int $id): JsonResponse
    {
        $webhook = Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $webhook->delete();

        return response()->json(null, 204);
    }

    public function rotateSecret(int $id): JsonResponse
    {
        $webhook = Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $newSecret = Str::random(40);
        $webhook->update(['secret' => $newSecret]);

        return response()->json(['secret' => $newSecret]);
    }

    public function deliveries(int $id): JsonResponse
    {
        $webhook = Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $deliveries = $webhook->deliveries()
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'event', 'response_status', 'duration_ms', 'attempt', 'success', 'created_at']);

        return response()->json($deliveries);
    }

    /**
     * Dispatch a webhook delivery with HMAC-SHA256 signature and retry.
     * Called internally by jobs/observers — not a route.
     */
    public static function dispatch(Webhook $webhook, string $event, array $payload): void
    {
        if (! $webhook->is_active) {
            return;
        }

        $body      = json_encode($payload);
        $signature = hash_hmac('sha256', $body, $webhook->secret);
        $attempt   = 1;
        $success   = false;
        $responseStatus = null;
        $responseBody   = null;
        $durationMs     = null;

        while ($attempt <= $webhook->retry_count + 1) {
            $start = microtime(true);

            try {
                $response = Http::timeout($webhook->timeout_seconds)
                    ->withHeaders([
                        'Content-Type'           => 'application/json',
                        'X-Signature-SHA256'     => 'sha256=' . $signature,
                        'X-Webhook-Event'        => $event,
                        'X-Webhook-Delivery'     => Str::uuid(),
                    ])
                    ->post($webhook->url, $payload);

                $responseStatus = $response->status();
                $responseBody   = substr($response->body(), 0, 1000);
                $durationMs     = (int) ((microtime(true) - $start) * 1000);
                $success        = $response->successful();

                if ($success) break;
            } catch (\Throwable) {
                $durationMs = (int) ((microtime(true) - $start) * 1000);
            }

            $attempt++;
            if ($attempt <= $webhook->retry_count + 1) {
                sleep(2 ** ($attempt - 2)); // exponential backoff: 1s, 2s, 4s
            }
        }

        \Illuminate\Support\Facades\DB::table('webhook_deliveries')->insert([
            'webhook_id'      => $webhook->id,
            'event'           => $event,
            'payload'         => json_encode($payload),
            'response_status' => $responseStatus,
            'response_body'   => $responseBody,
            'duration_ms'     => $durationMs,
            'attempt'         => $attempt,
            'success'         => $success,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $webhook->update([
            'last_triggered_at' => now(),
            'last_status'       => $success ? 'success' : 'failure',
        ]);
    }
}
