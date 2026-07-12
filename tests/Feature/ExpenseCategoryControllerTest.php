<?php

namespace Tests\Feature;

use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseCategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['tenant_id' => 1, 'role' => 'admin']);
        $this->actingAs($this->admin);
    }

    public function test_index_returns_root_categories_with_children(): void
    {
        $parent = ExpenseCategory::factory()->create(['tenant_id' => 1, 'parent_id' => null]);
        ExpenseCategory::factory()->create(['tenant_id' => 1, 'parent_id' => $parent->id]);

        $response = $this->getJson('/api/expense-categories')->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertNotEmpty($data[0]['children']);
    }

    public function test_store_creates_category(): void
    {
        $this->postJson('/api/expense-categories', [
            'name'             => '交通費',
            'code'             => 'TRANSPORT',
            'requires_receipt' => true,
        ])->assertCreated()->assertJsonPath('data.code', 'TRANSPORT');
    }

    public function test_duplicate_code_returns_422(): void
    {
        ExpenseCategory::factory()->create(['tenant_id' => 1, 'code' => 'TRAVEL']);

        $this->postJson('/api/expense-categories', [
            'name' => '旅費',
            'code' => 'TRAVEL',
        ])->assertUnprocessable();
    }

    public function test_nesting_beyond_two_levels_returns_422(): void
    {
        $grandparent = ExpenseCategory::factory()->create(['tenant_id' => 1, 'parent_id' => null]);
        $parent      = ExpenseCategory::factory()->create(['tenant_id' => 1, 'parent_id' => $grandparent->id]);

        $this->postJson('/api/expense-categories', [
            'name'      => '孫',
            'code'      => 'GRANDCHILD',
            'parent_id' => $parent->id,
        ])->assertUnprocessable();
    }

    public function test_destroy_blocked_when_has_children(): void
    {
        $parent = ExpenseCategory::factory()->create(['tenant_id' => 1]);
        ExpenseCategory::factory()->create(['tenant_id' => 1, 'parent_id' => $parent->id]);

        $this->deleteJson("/api/expense-categories/{$parent->id}")->assertConflict();
    }

    public function test_cannot_access_other_tenant_category(): void
    {
        $other = ExpenseCategory::factory()->create(['tenant_id' => 99]);
        $this->getJson("/api/expense-categories/{$other->id}")->assertNotFound();
    }
}
