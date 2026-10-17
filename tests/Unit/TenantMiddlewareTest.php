<?php

namespace Tests\Unit;

use App\Http\Middleware\TenantMiddleware;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class TenantMiddlewareTest extends TestCase
{
    private TenantMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new TenantMiddleware();
    }

    public function test_unauthenticated_request_returns_403(): void
    {
        Auth::shouldReceive('user')->andReturn(null);

        $request  = Request::create('/api/test');
        $response = $this->middleware->handle($request, fn() => new Response());

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function test_user_without_tenant_id_returns_403(): void
    {
        $user = new User(['tenant_id' => null]);
        Auth::shouldReceive('user')->andReturn($user);

        $request  = Request::create('/api/test');
        $response = $this->middleware->handle($request, fn() => new Response());

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function test_user_with_inactive_tenant_returns_403(): void
    {
        $tenant = new Tenant(['is_active' => false]);
        $user   = \Mockery::mock(User::class)->makePartial();
        $user->tenant_id = 1;
        $user->shouldReceive('getAttribute')->with('tenant')->andReturn($tenant);
        Auth::shouldReceive('user')->andReturn($user);

        $request  = Request::create('/api/test');
        $response = $this->middleware->handle($request, fn() => new Response());

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function test_valid_tenant_passes_through(): void
    {
        $tenant = new Tenant(['is_active' => true]);
        $user   = \Mockery::mock(User::class)->makePartial();
        $user->tenant_id = 5;
        $user->shouldReceive('getAttribute')->with('tenant')->andReturn($tenant);
        Auth::shouldReceive('user')->andReturn($user);

        $passed   = false;
        $request  = Request::create('/api/test');
        $response = $this->middleware->handle($request, function () use (&$passed) {
            $passed = true;
            return new Response('ok', 200);
        });

        $this->assertTrue($passed);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals(5, app('current.tenant_id'));
    }
}
