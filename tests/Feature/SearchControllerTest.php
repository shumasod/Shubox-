<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SearchControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1, 'name' => 'Alice', 'email' => 'alice@test.com']);
        $this->actingAs($this->user);
    }

    public function test_requires_minimum_query_length(): void
    {
        $this->getJson('/api/search?q=a')->assertUnprocessable();
    }

    public function test_returns_users_matching_name(): void
    {
        $response = $this->getJson('/api/search?q=Alice&type=user')->assertOk();
        $this->assertNotEmpty($response->json('results.users'));
        $this->assertSame('Alice', $response->json('results.users.0.label'));
    }

    public function test_cross_tenant_users_not_returned(): void
    {
        User::factory()->create(['tenant_id' => 99, 'name' => 'Alice Other', 'email' => 'other@other.com']);

        $response = $this->getJson('/api/search?q=Alice&type=user')->assertOk();
        // Only the current tenant's Alice should appear
        $this->assertCount(1, $response->json('results.users'));
    }

    public function test_total_sums_across_types(): void
    {
        $response = $this->getJson('/api/search?q=test')->assertOk();
        $results  = $response->json('results');
        $sum      = array_sum(array_map('count', $results));
        $this->assertSame($response->json('total'), $sum);
    }

    public function test_type_filter_limits_result_keys(): void
    {
        $response = $this->getJson('/api/search?q=Alice&type=user')->assertOk();
        $keys     = array_keys($response->json('results'));
        $this->assertSame(['users'], $keys);
    }
}
