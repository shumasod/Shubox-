<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private ExpenseCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant      = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();

        $this->user      = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'user']);
        $this->otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        $this->category  = ExpenseCategory::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_user_can_create_expense(): void
    {
        $payload = [
            'title'        => 'Business travel',
            'amount'       => 25000,
            'currency'     => 'JPY',
            'category_id'  => $this->category->id,
            'expense_date' => '2024-03-15',
        ];

        $this->actingAs($this->user)
            ->postJson('/api/v1/expenses', $payload)
            ->assertCreated()
            ->assertJsonPath('status', 'draft')
            ->assertJsonPath('amount', '25000.00');
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/v1/expenses', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'amount', 'category_id', 'expense_date']);
    }

    public function test_user_can_read_own_expense(): void
    {
        $expense = Expense::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/api/v1/expenses/{$expense->id}")
            ->assertOk()
            ->assertJsonPath('id', $expense->id);
    }

    public function test_user_cannot_read_other_tenant_expense(): void
    {
        $otherExpense = Expense::factory()->create([
            'tenant_id' => $this->otherUser->tenant_id,
            'user_id'   => $this->otherUser->id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/api/v1/expenses/{$otherExpense->id}")
            ->assertNotFound();
    }

    public function test_user_can_update_draft_expense(): void
    {
        $expense = Expense::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'draft',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/v1/expenses/{$expense->id}", ['title' => 'Updated title'])
            ->assertOk()
            ->assertJsonPath('title', 'Updated title');
    }

    public function test_user_cannot_update_submitted_expense(): void
    {
        $expense = Expense::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'pending',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/v1/expenses/{$expense->id}", ['title' => 'Hacked title'])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_draft(): void
    {
        $expense = Expense::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'draft',
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/api/v1/expenses/{$expense->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }

    public function test_user_cannot_delete_approved_expense(): void
    {
        $expense = Expense::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'approved',
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/api/v1/expenses/{$expense->id}")
            ->assertForbidden();
    }

    public function test_expense_list_is_scoped_to_tenant(): void
    {
        Expense::factory()->count(3)->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        Expense::factory()->count(2)->create([
            'tenant_id' => $this->otherUser->tenant_id,
            'user_id'   => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/expenses');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_expense_submit_changes_status_to_pending(): void
    {
        $expense = Expense::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'draft',
        ]);

        $this->actingAs($this->user)
            ->postJson("/api/v1/expenses/{$expense->id}/submit")
            ->assertOk()
            ->assertJsonPath('status', 'pending');
    }
}
