<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExpenseBulkControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        Sanctum::actingAs($this->user);
    }

    public function test_bulk_approve_pending_expenses(): void
    {
        $expenses = Expense::factory()->count(3)->create([
            'tenant_id' => 1, 'status' => 'pending',
        ]);

        $response = $this->postJson('/api/expenses/bulk', [
            'action' => 'approve',
            'ids'    => $expenses->pluck('id')->toArray(),
        ]);

        $response->assertOk();
        $this->assertEquals(3, $response->json('updated'));
        $this->assertEquals('approved', Expense::find($expenses->first()->id)->status);
    }

    public function test_bulk_reject_with_reason(): void
    {
        $expenses = Expense::factory()->count(2)->create([
            'tenant_id' => 1, 'status' => 'pending',
        ]);

        $response = $this->postJson('/api/expenses/bulk', [
            'action'           => 'reject',
            'ids'              => $expenses->pluck('id')->toArray(),
            'rejection_reason' => 'Missing receipts',
        ]);

        $response->assertOk();
        $this->assertEquals(2, $response->json('updated'));
        $this->assertEquals('Missing receipts', Expense::find($expenses->first()->id)->rejection_reason);
    }

    public function test_cross_tenant_ids_rejected(): void
    {
        $otherExpense = Expense::factory()->create(['tenant_id' => 99, 'status' => 'pending']);

        $response = $this->postJson('/api/expenses/bulk', [
            'action' => 'approve',
            'ids'    => [$otherExpense->id],
        ]);

        $response->assertStatus(422);
        $this->assertEquals('pending', $otherExpense->fresh()->status);
    }

    public function test_bulk_delete_only_removes_pending_and_rejected(): void
    {
        $pending  = Expense::factory()->create(['tenant_id' => 1, 'status' => 'pending']);
        $approved = Expense::factory()->create(['tenant_id' => 1, 'status' => 'approved']);

        $this->postJson('/api/expenses/bulk', [
            'action' => 'delete',
            'ids'    => [$pending->id, $approved->id],
        ])->assertOk();

        $this->assertNull(Expense::find($pending->id));
        $this->assertNotNull(Expense::find($approved->id));
    }

    public function test_invalid_action_returns_422(): void
    {
        $this->postJson('/api/expenses/bulk', [
            'action' => 'hack',
            'ids'    => [1],
        ])->assertStatus(422);
    }
}
