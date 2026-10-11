<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Expense;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $applicant;
    private User $approver;
    private User $otherTenantUser;
    private Expense $expense;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::factory()->create();
        $other  = Tenant::factory()->create();

        $this->applicant = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'employee']);
        $this->approver  = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'approver']);
        $this->otherTenantUser = User::factory()->create(['tenant_id' => $other->id, 'role' => 'employee']);

        $this->expense = Expense::factory()->create([
            'tenant_id'    => $tenant->id,
            'applicant_id' => $this->applicant->id,
        ]);
    }

    public function test_user_can_post_comment(): void
    {
        $response = $this->actingAs($this->applicant)
            ->postJson("/api/v1/expenses/{$this->expense->id}/comments", [
                'body' => '資料を追加しました。ご確認ください。',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.body', '資料を追加しました。ご確認ください。')
            ->assertJsonPath('data.user_id', $this->applicant->id);

        $this->assertDatabaseHas('comments', [
            'expense_id' => $this->expense->id,
            'user_id'    => $this->applicant->id,
        ]);
    }

    public function test_comment_requires_body(): void
    {
        $this->actingAs($this->applicant)
            ->postJson("/api/v1/expenses/{$this->expense->id}/comments", ['body' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_comment_body_max_length(): void
    {
        $this->actingAs($this->applicant)
            ->postJson("/api/v1/expenses/{$this->expense->id}/comments", [
                'body' => str_repeat('a', 2001),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_list_comments_for_expense(): void
    {
        Comment::factory()->count(3)->create([
            'expense_id' => $this->expense->id,
            'user_id'    => $this->applicant->id,
        ]);

        $response = $this->actingAs($this->approver)
            ->getJson("/api/v1/expenses/{$this->expense->id}/comments");

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_owner_can_delete_own_comment(): void
    {
        $comment = Comment::factory()->create([
            'expense_id' => $this->expense->id,
            'user_id'    => $this->applicant->id,
        ]);

        $this->actingAs($this->applicant)
            ->deleteJson("/api/v1/expenses/{$this->expense->id}/comments/{$comment->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_other_user_cannot_delete_comment(): void
    {
        $comment = Comment::factory()->create([
            'expense_id' => $this->expense->id,
            'user_id'    => $this->applicant->id,
        ]);

        $this->actingAs($this->approver)
            ->deleteJson("/api/v1/expenses/{$this->expense->id}/comments/{$comment->id}")
            ->assertForbidden();
    }

    public function test_cross_tenant_cannot_see_comments(): void
    {
        $this->actingAs($this->otherTenantUser)
            ->getJson("/api/v1/expenses/{$this->expense->id}/comments")
            ->assertNotFound();
    }
}
