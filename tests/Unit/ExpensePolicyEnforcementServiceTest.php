<?php

namespace Tests\Unit;

use App\Models\Expense;
use App\Models\ExpensePolicy;
use App\Services\ExpensePolicyEnforcementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpensePolicyEnforcementServiceTest extends TestCase
{
    use RefreshDatabase;

    private ExpensePolicyEnforcementService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ExpensePolicyEnforcementService();
    }

    public function test_no_violations_when_no_policies_exist(): void
    {
        $expense = Expense::factory()->make(['tenant_id' => 1, 'amount' => 5000]);

        $violations = $this->service->evaluate($expense);

        $this->assertCount(0, $violations);
    }

    public function test_max_amount_rule_triggers_violation(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 1,
            'is_active' => true,
            'rules'     => [['type' => 'max_amount', 'limit' => 10000, 'action' => 'flag']],
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'amount' => 15000]);

        $violations = $this->service->evaluate($expense);

        $this->assertCount(1, $violations);
        $this->assertEquals('max_amount', $violations->first()['rule']);
    }

    public function test_amount_below_limit_passes(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 1,
            'is_active' => true,
            'rules'     => [['type' => 'max_amount', 'limit' => 50000, 'action' => 'flag']],
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'amount' => 3000]);

        $this->assertCount(0, $this->service->evaluate($expense));
    }

    public function test_category_blocked_rule_triggers(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 1,
            'is_active' => true,
            'rules'     => [['type' => 'category_blocked', 'category_ids' => [5, 10], 'action' => 'reject']],
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'category_id' => 5]);

        $violations = $this->service->evaluate($expense);

        $this->assertCount(1, $violations);
        $this->assertEquals('reject', $violations->first()['action']);
    }

    public function test_inactive_policies_are_skipped(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 1,
            'is_active' => false,
            'rules'     => [['type' => 'max_amount', 'limit' => 100, 'action' => 'reject']],
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'amount' => 99999]);

        $this->assertCount(0, $this->service->evaluate($expense));
    }

    public function test_enforce_sets_flagged_status_on_flag_action(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 1,
            'is_active' => true,
            'rules'     => [['type' => 'max_amount', 'limit' => 1000, 'action' => 'flag']],
        ]);

        $expense = Expense::factory()->create(['tenant_id' => 1, 'amount' => 5000, 'status' => 'pending']);

        $this->service->enforce($expense);

        $this->assertEquals('flagged', $expense->fresh()->status);
    }

    public function test_enforce_sets_rejected_status_on_reject_action(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 1,
            'is_active' => true,
            'rules'     => [['type' => 'max_amount', 'limit' => 1000, 'action' => 'reject']],
        ]);

        $expense = Expense::factory()->create(['tenant_id' => 1, 'amount' => 50000, 'status' => 'pending']);

        $this->service->enforce($expense);

        $this->assertEquals('rejected', $expense->fresh()->status);
        $this->assertNotNull($expense->fresh()->rejection_reason);
    }

    public function test_cross_tenant_policies_do_not_apply(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id' => 99,
            'is_active' => true,
            'rules'     => [['type' => 'max_amount', 'limit' => 0, 'action' => 'reject']],
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'amount' => 99999]);

        $this->assertCount(0, $this->service->evaluate($expense));
    }
}
