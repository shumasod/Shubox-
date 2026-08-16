<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireVerifiedEmail
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && !$user->hasVerifiedEmail()) {
            return response()->json([
                'message'    => 'Email address not verified.',
                'verify_url' => route('verification.notice'),
            ], 403);
        }

        return $next($request);
    }
}
