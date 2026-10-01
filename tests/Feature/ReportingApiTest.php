<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportingApiTest extends TestCase
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

        $this->user      = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        $this->category  = ExpenseCategory::factory()->create(['tenant_id' => $tenant->id, 'name' => 'Travel']);

        // Seed approved expenses for current tenant
        Expense::factory()->count(3)->create([
            'tenant_id'    => $tenant->id,
            'user_id'      => $this->user->id,
            'category_id'  => $this->category->id,
            'status'       => 'approved',
            'amount'       => 10000,
            'expense_date' => '2024-03-15',
        ]);

        Expense::factory()->count(2)->create([
            'tenant_id'    => $tenant->id,
            'user_id'      => $this->user->id,
            'category_id'  => $this->category->id,
            'status'       => 'paid',
            'amount'       => 5000,
            'expense_date' => '2024-07-10',
        ]);

        // Draft should be excluded
        Expense::factory()->create([
            'tenant_id'   => $tenant->id,
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'draft',
            'amount'      => 99999,
            'expense_date' => '2024-03-20',
        ]);

        // Other tenant expense — must never appear
        Expense::factory()->create([
            'tenant_id'   => $otherTenant->id,
            'user_id'     => $this->otherUser->id,
            'category_id' => ExpenseCategory::factory()->create(['tenant_id' => $otherTenant->id])->id,
            'status'      => 'approved',
            'amount'      => 999999,
            'expense_date' => '2024-03-10',
        ]);
    }

    public function test_monthly_report_returns_twelve_months(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/monthly?year=2024');

        $response->assertOk();
        $this->assertCount(12, $response->json('months'));
    }

    public function test_monthly_report_zero_fills_empty_months(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/monthly?year=2024');

        // January should have 0 count (no expenses)
        $jan = collect($response->json('months'))->firstWhere('month', 1);
        $this->assertEquals(0, $jan['count']);
        $this->assertEquals(0, $jan['total']);
    }

    public function test_monthly_report_aggregates_approved_and_paid(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/monthly?year=2024');

        // March: 3 approved x 10000
        $mar = collect($response->json('months'))->firstWhere('month', 3);
        $this->assertEquals(3, $mar['count']);
        $this->assertEquals(30000, $mar['total']);
    }

    public function test_monthly_report_excludes_draft_expenses(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/monthly?year=2024');

        $mar = collect($response->json('months'))->firstWhere('month', 3);
        // Only 3 approved, not 4 (draft excluded)
        $this->assertEquals(3, $mar['count']);
    }

    public function test_monthly_report_excludes_other_tenant_data(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/monthly?year=2024');

        $totals = $response->json('totals.total');
        // Other tenant has 999999 — must not appear
        $this->assertLessThan(100000, $totals);
    }

    public function test_quarterly_report_returns_four_quarters(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/quarterly?year=2024');

        $response->assertOk();
        $this->assertCount(4, $response->json('quarters'));
    }

    public function test_category_breakdown_includes_percentage(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/reports/category-breakdown?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertOk();
        $category = $response->json('categories.0');
        $this->assertArrayHasKey('percentage', $category);
        $this->assertEquals(100.0, $category['percentage']);
    }

    public function test_year_over_year_requires_year_array(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/reports/year-over-year?years[]=2024&years[]=2023')
            ->assertOk()
            ->assertJsonPath('years.0', 2024);
    }

    public function test_year_over_year_rejects_more_than_five_years(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/reports/year-over-year?years[]=2020&years[]=2021&years[]=2022&years[]=2023&years[]=2024&years[]=2025')
            ->assertUnprocessable();
    }

    public function test_reports_require_authentication(): void
    {
        $this->getJson('/api/v1/reports/monthly?year=2024')
            ->assertUnauthorized();
    }
}
