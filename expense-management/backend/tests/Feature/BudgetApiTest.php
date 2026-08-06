<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $employee;
    private int $tenantId;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::factory()->create();
        $this->tenantId = $tenant->id;

        $this->admin = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role'      => 'admin',
        ]);

        $this->employee = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role'      => 'employee',
        ]);
    }

    public function test_admin_can_create_budget(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/budgets', [
                'fiscal_year' => 2025,
                'amount'      => 1000000,
                'note'        => 'Q1 budget',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.fiscal_year', 2025)
            ->assertJsonPath('data.amount', 1000000)
            ->assertJsonPath('data.spent', 0)
            ->assertJsonPath('data.remaining', 1000000)
            ->assertJsonPath('data.usage_rate', 0);

        $this->assertDatabaseHas('budgets', [
            'tenant_id'   => $this->tenantId,
            'fiscal_year' => 2025,
            'amount'      => 1000000,
        ]);
    }

    public function test_remaining_and_usage_rate_are_computed(): void
    {
        $budget = Budget::factory()->create([
            'tenant_id'   => $this->tenantId,
            'fiscal_year' => 2025,
            'amount'      => 200000,
            'spent'       => 50000,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/v1/budgets/{$budget->id}");

        $response->assertOk()
            ->assertJsonPath('data.remaining', 150000)
            ->assertJsonPath('data.usage_rate', 25.0);
    }

    public function test_duplicate_budget_returns_422(): void
    {
        Budget::factory()->create([
            'tenant_id'     => $this->tenantId,
            'fiscal_year'   => 2025,
            'department_id' => null,
            'category_id'   => null,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/budgets', [
                'fiscal_year' => 2025,
                'amount'      => 999999,
            ]);

        $response->assertStatus(422);
    }

    public function test_budget_index_filtered_by_fiscal_year(): void
    {
        Budget::factory()->create(['tenant_id' => $this->tenantId, 'fiscal_year' => 2024, 'amount' => 100]);
        Budget::factory()->create(['tenant_id' => $this->tenantId, 'fiscal_year' => 2025, 'amount' => 200]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/budgets?fiscal_year=2025');

        $response->assertOk();
        $items = $response->json('data');
        $this->assertCount(1, $items);
        $this->assertEquals(2025, $items[0]['fiscal_year']);
    }

    public function test_cross_tenant_isolation(): void
    {
        $otherTenant = Tenant::factory()->create();
        $otherBudget = Budget::factory()->create([
            'tenant_id'   => $otherTenant->id,
            'fiscal_year' => 2025,
            'amount'      => 5000000,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/v1/budgets/{$otherBudget->id}");

        $response->assertNotFound();
    }

    public function test_delete_budget(): void
    {
        $budget = Budget::factory()->create([
            'tenant_id'   => $this->tenantId,
            'fiscal_year' => 2025,
            'amount'      => 300000,
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
    }

    public function test_update_budget_amount(): void
    {
        $budget = Budget::factory()->create([
            'tenant_id'   => $this->tenantId,
            'fiscal_year' => 2025,
            'amount'      => 100000,
            'spent'       => 80000,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['amount' => 200000]);

        $response->assertOk()
            ->assertJsonPath('data.amount', 200000)
            ->assertJsonPath('data.remaining', 120000)
            ->assertJsonPath('data.usage_rate', 40.0);
    }
}
