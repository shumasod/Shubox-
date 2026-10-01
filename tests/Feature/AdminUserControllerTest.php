<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = Tenant::factory()->create();
        $this->admin = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'admin',
        ]);
    }

    public function test_index_returns_only_tenant_users(): void
    {
        User::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);
        User::factory()->count(2)->create();

        $this->actingAs($this->admin)
            ->getJson('/api/admin/users')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 4); // 3 + admin
    }

    public function test_invite_creates_user_with_verification_email(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users/invite', [
                'email' => 'newuser@example.com',
                'name'  => 'New User',
                'role'  => 'employee',
            ])
            ->assertStatus(201)
            ->assertJsonPath('email', 'newuser@example.com');

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com', 'tenant_id' => $this->tenant->id]);
    }

    public function test_update_prevents_self_role_change(): void
    {
        $this->actingAs($this->admin)
            ->patchJson("/api/admin/users/{$this->admin->id}", ['role' => 'employee'])
            ->assertStatus(403);
    }

    public function test_suspend_revokes_tokens(): void
    {
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->createToken('test-token');

        $this->actingAs($this->admin)
            ->postJson("/api/admin/users/{$user->id}/suspend")
            ->assertStatus(200);

        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
        $this->assertFalse($user->fresh()->is_active);
    }

    public function test_cannot_suspend_self(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/admin/users/{$this->admin->id}/suspend")
            ->assertStatus(403);
    }
}
