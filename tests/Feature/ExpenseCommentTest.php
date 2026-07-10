<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseCommentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Expense $expense;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user    = User::factory()->create(['tenant_id' => 1, 'role' => 'employee']);
        $this->expense = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->user->id]);
    }

    public function test_user_can_list_comments(): void
    {
        ExpenseComment::factory()->count(3)->create([
            'tenant_id'  => 1,
            'expense_id' => $this->expense->id,
            'user_id'    => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/api/expenses/{$this->expense->id}/comments")
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_post_comment(): void
    {
        $this->actingAs($this->user)
            ->postJson("/api/expenses/{$this->expense->id}/comments", ['body' => 'Test comment'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Test comment')
            ->assertJsonPath('data.user.id', $this->user->id);
    }

    public function test_empty_body_is_rejected(): void
    {
        $this->actingAs($this->user)
            ->postJson("/api/expenses/{$this->expense->id}/comments", ['body' => ''])
            ->assertUnprocessable();
    }

    public function test_author_can_update_own_comment(): void
    {
        $comment = ExpenseComment::factory()->create([
            'tenant_id'  => 1,
            'expense_id' => $this->expense->id,
            'user_id'    => $this->user->id,
            'body'       => 'Original',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/expenses/{$this->expense->id}/comments/{$comment->id}", ['body' => 'Updated'])
            ->assertOk()
            ->assertJsonPath('data.body', 'Updated');
    }

    public function test_non_author_cannot_update_comment(): void
    {
        $other   = User::factory()->create(['tenant_id' => 1]);
        $comment = ExpenseComment::factory()->create([
            'tenant_id'  => 1,
            'expense_id' => $this->expense->id,
            'user_id'    => $this->user->id,
        ]);

        $this->actingAs($other)
            ->patchJson("/api/expenses/{$this->expense->id}/comments/{$comment->id}", ['body' => 'Hacked'])
            ->assertNotFound();
    }

    public function test_author_can_delete_comment(): void
    {
        $comment = ExpenseComment::factory()->create([
            'tenant_id'  => 1,
            'expense_id' => $this->expense->id,
            'user_id'    => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/api/expenses/{$this->expense->id}/comments/{$comment->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('expense_comments', ['id' => $comment->id]);
    }

    public function test_cross_tenant_expense_returns_404(): void
    {
        $otherUser    = User::factory()->create(['tenant_id' => 2]);
        $otherExpense = Expense::factory()->create(['tenant_id' => 2, 'user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->getJson("/api/expenses/{$otherExpense->id}/comments")
            ->assertNotFound();
    }

    public function test_body_max_length_enforced(): void
    {
        $this->actingAs($this->user)
            ->postJson("/api/expenses/{$this->expense->id}/comments", [
                'body' => str_repeat('a', 5001),
            ])
            ->assertUnprocessable();
    }
}
