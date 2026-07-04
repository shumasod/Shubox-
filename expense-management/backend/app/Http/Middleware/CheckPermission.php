<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => '認証が必要です'], 401);
        }

        $userPermissions = $user->role?->permissions?->pluck('code')->toArray() ?? [];

        foreach ($permissions as $permission) {
            if (!in_array($permission, $userPermissions, true)) {
                return response()->json(
                    ['message' => 'この操作を行う権限がありません'],
                    403
                );
            }
        }

        return $next($request);
    }
}
