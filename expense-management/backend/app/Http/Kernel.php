<?php

declare(strict_types=1);

namespace App\Http;

use App\Http\Middleware\AuditLogMiddleware;
use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\TenantMiddleware;
use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [
        SecurityHeaders::class,
        ForceJsonResponse::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    protected $middlewareGroups = [
        'api' => [
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            AuditLogMiddleware::class,
        ],
    ];

    protected $routeMiddleware = [
        'auth'       => \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'tenant'     => TenantMiddleware::class,
        'permission' => CheckPermission::class,
        'throttle'   => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    ];
}
