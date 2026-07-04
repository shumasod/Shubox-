<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    private const HEADERS = [
        'X-Content-Type-Options'           => 'nosniff',
        'X-Frame-Options'                  => 'DENY',
        'X-XSS-Protection'                 => '1; mode=block',
        'Referrer-Policy'                  => 'strict-origin-when-cross-origin',
        'Permissions-Policy'               => 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security'        => 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy'          => "default-src 'none'; frame-ancestors 'none'",
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach (self::HEADERS as $header => $value) {
            $response->headers->set($header, $value);
        }

        // Remove server-identifying headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
