<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Expense;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    }

    public function test_index_returns_only_tenant_logs(): void
    {
        $otherTenant = Tenant::factory()->create();

        AuditLog::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);
        AuditLog::factory()->count(2)->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->getJson('/api/audit-logs')
            ->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_index_filters_by_event(): void
    {
        AuditLog::factory()->create(['tenant_id' => $this->tenant->id, 'event' => 'expense.approved']);
        AuditLog::factory()->create(['tenant_id' => $this->tenant->id, 'event' => 'expense.rejected']);

        $this->actingAs($this->user)
            ->getJson('/api/audit-logs?event=expense.approved')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_show_returns_correct_log(): void
    {
        $log = AuditLog::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->actingAs($this->user)
            ->getJson("/api/audit-logs/{$log->id}")
            ->assertStatus(200)
            ->assertJsonPath('id', $log->id);
    }

    public function test_show_returns_404_for_other_tenant(): void
    {
        $otherTenant = Tenant::factory()->create();
        $log = AuditLog::factory()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->getJson("/api/audit-logs/{$log->id}")
            ->assertStatus(404);
    }

    public function test_for_resource_returns_logs_for_model(): void
    {
        $expense = Expense::factory()->create(['tenant_id' => $this->tenant->id]);

        AuditLog::factory()->count(2)->create([
            'tenant_id'      => $this->tenant->id,
            'auditable_type' => Expense::class,
            'auditable_id'   => $expense->id,
        ]);
        AuditLog::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->actingAs($this->user)
            ->getJson('/api/audit-logs/resource/' . urlencode(Expense::class) . '/' . $expense->id)
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
