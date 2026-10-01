<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_healthy_when_all_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('status', 'healthy')
            ->assertJsonStructure([
                'status', 'checks' => ['database', 'cache', 'storage', 'queue'], 'version', 'env',
            ]);
    }

    public function test_health_returns_503_when_database_down(): void
    {
        DB::shouldReceive('select')->andThrow(new \Exception('Connection refused'));

        $this->getJson('/api/health')
            ->assertStatus(503)
            ->assertJsonPath('status', 'degraded')
            ->assertJsonPath('checks.database.status', 'error');
    }

    public function test_health_includes_version_and_environment(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('env', app()->environment());
    }
}
