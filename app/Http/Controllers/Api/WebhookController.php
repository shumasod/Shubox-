<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
    }
}
