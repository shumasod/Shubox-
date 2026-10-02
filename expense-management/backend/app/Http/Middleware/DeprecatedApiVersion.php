<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeprecatedApiVersion
{
    /**
     * Add deprecation headers to v1 API responses.
     * RFC 8594 Deprecation header + Sunset date + Link to migration guide.
     */
    public function handle(Request $request, Closure $next, string $version = 'v1'): Response
    {
        $response = $next($request);

        $sunsetDate = match ($version) {
            'v1'    => 'Sat, 31 Dec 2025 23:59:59 GMT',
            default => null,
        };

        if ($sunsetDate) {
            $response->headers->set('Deprecation', 'true');
            $response->headers->set('Sunset', $sunsetDate);
            $response->headers->set(
                'Link',
                '</docs/api/migration-v1-to-v2>; rel="deprecation"; type="text/html"'
            );
            $response->headers->set('X-Api-Version', $version);
        }

        return $response;
    }
}
