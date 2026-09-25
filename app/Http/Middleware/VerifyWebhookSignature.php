<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    public function handle(Request $request, Closure $next, string $secretKey = 'webhook'): Response
    {
        $secret = config("services.webhooks.{$secretKey}_secret");

        if (empty($secret)) {
            abort(500, 'Webhook secret not configured');
        }

        $signature = $request->header('X-Webhook-Signature');

        if (empty($signature)) {
            abort(401, 'Missing webhook signature');
        }

        $payload = $request->getContent();
        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expected, $signature)) {
            abort(403, 'Invalid webhook signature');
        }

        $timestamp = $request->header('X-Webhook-Timestamp');
        if ($timestamp && abs(time() - (int) $timestamp) > 300) {
            abort(403, 'Webhook timestamp too old (replay attack prevention)');
        }

        return $next($request);
    }
}
