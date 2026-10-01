<?php

namespace Tests\Unit;

use App\Models\ExpensePolicy;
use App\Models\Tenant;
use App\Models\User;
use App\Services\ExpensePolicyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpensePolicyServiceTest extends TestCase
{
    use RefreshDatabase;

    private ExpensePolicyService $service;
    private User $user;
    private int $categoryId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service  = new ExpensePolicyService();
        $tenant         = Tenant::factory()->create();
        $this->user     = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'user']);
        $category       = \App\Models\ExpenseCategory::factory()->create(['tenant_id' => $tenant->id]);
        $this->categoryId = $category->id;
    }

    public function test_passes_when_no_policies_configured(): void
    {
        $result = $this->service->check($this->user, $this->categoryId, 100000);

        $this->assertTrue($result['passed']);
        $this->assertEmpty($result['violations']);
    }

    public function test_fails_when_amount_exceeds_max(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'  => $this->user->tenant_id,
            'category_id' => null,
            'role'        => null,
            'max_amount'  => 50000,
            'is_active'   => true,
            'priority'    => 0,
        ]);

        $result = $this->service->check($this->user, $this->categoryId, 60000);

        $this->assertFalse($result['passed']);
        $this->assertCount(1, $result['violations']);
        $this->assertEquals('max_amount_exceeded', $result['violations'][0]['type']);
    }

    public function test_passes_when_amount_equals_max(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'max_amount'  => 50000,
            'is_active'   => true,
        ]);

        $result = $this->service->check($this->user, $this->categoryId, 50000);

        $this->assertTrue($result['passed']);
    }

    public function test_receipt_required_violation_when_above_threshold(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'              => $this->user->tenant_id,
            'requires_receipt_above' => true,
            'receipt_threshold'      => 5000,
            'is_active'              => true,
        ]);

        $result = $this->service->check($this->user, $this->categoryId, 6000);

        $violations = collect($result['violations'])->pluck('type');
        $this->assertContains('receipt_required', $violations->all());
    }

    public function test_no_receipt_violation_when_below_threshold(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'              => $this->user->tenant_id,
            'requires_receipt_above' => true,
            'receipt_threshold'      => 5000,
            'is_active'              => true,
        ]);

        $result = $this->service->check($this->user, $this->categoryId, 3000);

        $violations = collect($result['violations'])->pluck('type');
        $this->assertNotContains('receipt_required', $violations->all());
    }

    public function test_inactive_policy_is_ignored(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'  => $this->user->tenant_id,
            'max_amount' => 100,
            'is_active'  => false,
        ]);

        $result = $this->service->check($this->user, $this->categoryId, 99999);

        $this->assertTrue($result['passed']);
    }

    public function test_category_specific_policy_applies(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'   => $this->user->tenant_id,
            'category_id' => $this->categoryId,
            'max_amount'  => 10000,
            'is_active'   => true,
            'priority'    => 10,
        ]);

        $otherCategory = \App\Models\ExpenseCategory::factory()->create(['tenant_id' => $this->user->tenant_id]);

        // Violates for target category
        $result1 = $this->service->check($this->user, $this->categoryId, 15000);
        $this->assertFalse($result1['passed']);

        // Passes for other category (policy doesn't apply)
        $result2 = $this->service->check($this->user, $otherCategory->id, 15000);
        $this->assertTrue($result2['passed']);
    }

    public function test_multiple_violations_returned(): void
    {
        ExpensePolicy::factory()->create([
            'tenant_id'                  => $this->user->tenant_id,
            'max_amount'                 => 1000,
            'requires_receipt_above'     => true,
            'receipt_threshold'          => 500,
            'requires_manager_note_above' => true,
            'manager_note_threshold'     => 800,
            'is_active'                  => true,
        ]);

        $result = $this->service->check($this->user, $this->categoryId, 2000);

        $this->assertFalse($result['passed']);
        $this->assertGreaterThanOrEqual(2, count($result['violations']));
    }
}
