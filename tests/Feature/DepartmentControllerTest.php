<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentControllerTest extends TestCase
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

    public function test_index_returns_tenant_departments(): void
    {
        Department::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);
        Department::factory()->count(2)->create();

        $this->actingAs($this->user)
            ->getJson('/api/departments')
            ->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_store_creates_department(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/departments', [
                'name' => '営業部',
                'code' => 'SALES',
            ])
            ->assertStatus(201)
            ->assertJsonPath('name', '営業部')
            ->assertJsonPath('code', 'SALES');
    }

    public function test_store_rejects_duplicate_code(): void
    {
        Department::factory()->create(['tenant_id' => $this->tenant->id, 'code' => 'SALES']);

        $this->actingAs($this->user)
            ->postJson('/api/departments', ['name' => '営業部２', 'code' => 'SALES'])
            ->assertStatus(409);
    }

    public function test_update_prevents_self_as_parent(): void
    {
        $dept = Department::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->actingAs($this->user)
            ->putJson("/api/departments/{$dept->id}", ['parent_id' => $dept->id])
            ->assertStatus(422);
    }

    public function test_destroy_fails_with_active_users(): void
    {
        $dept = Department::factory()->create(['tenant_id' => $this->tenant->id]);
        User::factory()->create(['tenant_id' => $this->tenant->id, 'department_id' => $dept->id]);

        $this->actingAs($this->user)
            ->deleteJson("/api/departments/{$dept->id}")
            ->assertStatus(409);
    }
}
