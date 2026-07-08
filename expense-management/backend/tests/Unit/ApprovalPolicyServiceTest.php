<?php

namespace Tests\Unit;

use App\Models\ApprovalFlow;
use App\Models\Expense;
use App\Services\ApprovalPolicyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalPolicyServiceTest extends TestCase
{
    use RefreshDatabase;

    private ApprovalPolicyService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ApprovalPolicyService();
    }

    public function test_resolves_flow_by_amount_range(): void
    {
        $flow = ApprovalFlow::factory()->create([
            'tenant_id'  => 1,
            'min_amount' => 10000,
            'max_amount' => 100000,
            'is_active'  => true,
            'priority'   => 1,
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'total_amount' => 50000]);

        $resolved = $this->service->resolveFlow($expense);
        $this->assertNotNull($resolved);
        $this->assertEquals($flow->id, $resolved->id);
    }

    public function test_returns_null_when_no_matching_flow(): void
    {
        ApprovalFlow::factory()->create([
            'tenant_id'  => 1,
            'min_amount' => 100000,
            'max_amount' => null,
            'is_active'  => true,
            'priority'   => 1,
        ]);

        $expense = Expense::factory()->make(['tenant_id' => 1, 'total_amount' => 5000]);

        $this->assertNull($this->service->resolveFlow($expense));
    }

    public function test_build_approver_chain_sorts_by_order(): void
    {
        $flow = ApprovalFlow::factory()->make([
            'steps' => [
                ['order' => 2, 'approver_id' => 20],
                ['order' => 1, 'approver_id' => 10],
                ['order' => 3, 'approver_id' => 30],
            ],
        ]);

        $chain = $this->service->buildApproverChain($flow);
        $this->assertEquals([10, 20, 30], $chain);
    }
}
