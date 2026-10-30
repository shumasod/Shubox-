<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthCheckControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_returns_200_when_healthy(): void
    {
        $this->getJson('/health')
            ->assertOk()
            ->assertJsonPath('status', 'healthy')
            ->assertJsonStructure(['status', 'checks' => ['database', 'cache', 'storage', 'queue']]);
    }

    public function test_liveness_always_returns_200(): void
    {
        $this->getJson('/health/live')->assertOk()->assertJsonPath('status', 'alive');
    }

    public function test_readiness_returns_200_when_db_ok(): void
    {
        $this->getJson('/health/ready')->assertOk()->assertJsonPath('status', 'ready');
    }

    public function test_health_returns_503_on_db_failure(): void
    {
        DB::shouldReceive('selectOne')->andThrow(new \Exception('Connection refused'));

        $this->getJson('/health')->assertStatus(503)->assertJsonPath('status', 'degraded');
    }

    public function test_cache_check_detects_mismatch(): void
    {
        Cache::shouldReceive('put')->once()->andReturn(true);
        Cache::shouldReceive('get')->once()->andReturn('WRONG');
        Cache::shouldReceive('forget')->once();

        $response = $this->getJson('/health')->assertStatus(503);
        $this->assertSame('error', $response->json('checks.cache.status'));
    }
}
