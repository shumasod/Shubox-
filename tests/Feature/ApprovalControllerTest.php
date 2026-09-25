<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseApproval;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $approver;
    private User $submitter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->approver  = User::factory()->create(['tenant_id' => 1, 'role' => 'manager']);
        $this->submitter = User::factory()->create(['tenant_id' => 1]);
        $this->actingAs($this->approver);
    }

    public function test_pending_returns_only_approvers_items(): void
    {
        $expense  = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->submitter->id, 'status' => 'submitted']);
        ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $expense->id, 'approver_id' => $this->approver->id]);

        $other = User::factory()->create(['tenant_id' => 1]);
        ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $expense->id, 'approver_id' => $other->id]);

        $response = $this->getJson('/api/approvals/pending')->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_approve_sets_action_and_advances_workflow(): void
    {
        $expense  = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->submitter->id, 'status' => 'submitted']);
        $approval = ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $expense->id, 'approver_id' => $this->approver->id, 'step_order' => 1]);

        $this->postJson("/api/approvals/{$approval->id}/approve", ['comment' => 'Looks good'])
            ->assertOk();

        $this->assertSame('approved', $approval->fresh()->action);
        $this->assertSame('approved', $expense->fresh()->status);
    }

    public function test_reject_requires_comment(): void
    {
        $expense  = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->submitter->id, 'status' => 'submitted']);
        $approval = ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $expense->id, 'approver_id' => $this->approver->id]);

        $this->postJson("/api/approvals/{$approval->id}/reject", [])->assertUnprocessable();
    }

    public function test_reject_cancels_remaining_steps(): void
    {
        $expense   = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->submitter->id, 'status' => 'submitted']);
        $step1     = ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $expense->id, 'approver_id' => $this->approver->id, 'step_order' => 1]);
        $step2     = ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $expense->id, 'step_order' => 2]);

        $this->postJson("/api/approvals/{$step1->id}/reject", ['comment' => '不備あり'])->assertOk();

        $this->assertSame('rejected', $expense->fresh()->status);
        $this->assertSame('cancelled', $step2->fresh()->action);
    }

    public function test_bulk_approve_processes_multiple(): void
    {
        $e1 = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->submitter->id, 'status' => 'submitted']);
        $e2 = Expense::factory()->create(['tenant_id' => 1, 'user_id' => $this->submitter->id, 'status' => 'submitted']);
        $a1 = ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $e1->id, 'approver_id' => $this->approver->id]);
        $a2 = ExpenseApproval::factory()->create(['tenant_id' => 1, 'expense_id' => $e2->id, 'approver_id' => $this->approver->id]);

        $this->postJson('/api/approvals/bulk-approve', ['ids' => [$a1->id, $a2->id]])
            ->assertOk()
            ->assertJsonPath('approved', 2);
    }
}
