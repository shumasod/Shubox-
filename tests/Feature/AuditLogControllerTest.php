<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private int $tenantId = 1;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => $this->tenantId, 'role' => 'admin']);
    }

    public function test_index_returns_tenant_scoped_logs(): void
    {
        AuditLog::factory()->count(3)->create(['tenant_id' => $this->tenantId]);
        AuditLog::factory()->count(2)->create(['tenant_id' => 999]);

        $response = $this->actingAs($this->user)->getJson('/api/audit-logs');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_index_filters_by_event(): void
    {
        AuditLog::factory()->create(['tenant_id' => $this->tenantId, 'event' => 'approved']);
        AuditLog::factory()->create(['tenant_id' => $this->tenantId, 'event' => 'rejected']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/audit-logs?event=approved');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('approved', $response->json('data.0.event'));
    }

    public function test_for_resource_returns_logs_for_specific_expense(): void
    {
        $expense = Expense::factory()->create(['tenant_id' => $this->tenantId]);
        AuditLog::factory()->count(2)->create([
            'tenant_id'      => $this->tenantId,
            'auditable_type' => 'App\\Models\\Expense',
            'auditable_id'   => $expense->id,
        ]);
        AuditLog::factory()->create([
            'tenant_id'      => $this->tenantId,
            'auditable_type' => 'App\\Models\\Expense',
            'auditable_id'   => 9999,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/audit-logs/expenses/{$expense->id}");

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    public function test_cross_tenant_log_returns_404(): void
    {
        $log = AuditLog::factory()->create(['tenant_id' => 999]);

        $this->actingAs($this->user)
            ->getJson("/api/audit-logs/{$log->id}")
            ->assertNotFound();
    }
}
