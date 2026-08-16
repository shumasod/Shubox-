<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExpenseSearchTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        Sanctum::actingAs($this->user);
    }

    public function test_returns_all_expenses_without_filters(): void
    {
        Expense::factory()->count(3)->create(['tenant_id' => 1, 'user_id' => $this->user->id]);

        $response = $this->getJson('/api/expenses/search');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_filters_by_keyword_in_title(): void
    {
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'title' => 'Taxi to airport']);
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'title' => 'Hotel stay']);

        $response = $this->getJson('/api/expenses/search?q=taxi');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Taxi to airport', $response->json('data.0.title'));
    }

    public function test_filters_by_status_array(): void
    {
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'status' => 'approved']);
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'status' => 'pending']);
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'status' => 'rejected']);

        $response = $this->getJson('/api/expenses/search?status[]=approved&status[]=pending');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_filters_by_amount_range(): void
    {
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'amount' => 500]);
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'amount' => 5000]);
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'amount' => 50000]);

        $response = $this->getJson('/api/expenses/search?amount_min=1000&amount_max=10000');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('5000.00', $response->json('data.0.amount'));
    }

    public function test_cross_tenant_expenses_not_returned(): void
    {
        Expense::factory()->create(['tenant_id' => 99, 'user_id' => $this->user->id, 'title' => 'Other tenant']);

        $response = $this->getJson('/api/expenses/search?q=other+tenant');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_cursor_pagination_returns_next_cursor(): void
    {
        Expense::factory()->count(5)->create(['tenant_id' => 1, 'user_id' => $this->user->id]);

        $response = $this->getJson('/api/expenses/search?per_page=2');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertTrue($response->json('has_more'));
        $this->assertNotNull($response->json('next_cursor'));
    }

    public function test_aggregations_by_status_returned(): void
    {
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'status' => 'approved', 'amount' => 1000]);
        Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id, 'status' => 'pending', 'amount' => 2000]);

        $response = $this->getJson('/api/expenses/search');

        $response->assertOk();
        $aggs = $response->json('aggs.by_status');
        $this->assertArrayHasKey('approved', $aggs);
        $this->assertEquals(1, $aggs['approved']['count']);
    }
}
