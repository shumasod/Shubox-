<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user || !$user->tenant_id) {
            return response()->json(['message' => 'Tenant context not established.'], 403);
        }

        if (!$user->tenant?->is_active) {
            return response()->json(['message' => 'Tenant account is suspended.'], 403);
        }

        // Bind the current tenant_id to the request so controllers can read it
        app()->instance('current.tenant_id', $user->tenant_id);

        return $next($request);
    }
}
