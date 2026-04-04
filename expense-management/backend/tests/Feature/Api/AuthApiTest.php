<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Infrastructure\Persistence\Eloquent\Models\RoleModel;
use App\Infrastructure\Persistence\Eloquent\Models\TenantModel;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;
    private UserModel $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = TenantModel::create([
            'id' => Str::uuid(),
            'name' => 'テスト株式会社',
            'slug' => 'test-corp',
            'is_active' => true,
        ]);

        $role = RoleModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '一般',
            'is_system_role' => false,
        ]);

        $this->user = UserModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'テストユーザー',
            'email' => 'test@test.com',
            'password' => bcrypt('P@ssw0rd!'),
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function test_login_returns_token(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@test.com',
            'password' => 'P@ssw0rd!',
            'tenant_slug' => 'test-corp',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
                'user' => ['id', 'name', 'email', 'tenant_id'],
            ])
            ->assertJson([
                'token_type' => 'Bearer',
                'expires_in' => 86400,
            ]);
    }

    /** @test */
    public function test_login_fails_with_wrong_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@test.com',
            'password' => 'wrongpassword',
            'tenant_slug' => 'test-corp',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function test_login_fails_with_unknown_tenant(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@test.com',
            'password' => 'P@ssw0rd!',
            'tenant_slug' => 'unknown-tenant',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tenant_slug']);
    }

    /** @test */
    public function test_login_fails_with_inactive_user(): void
    {
        $this->user->update(['is_active' => false]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@test.com',
            'password' => 'P@ssw0rd!',
            'tenant_slug' => 'test-corp',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_me_returns_current_user(): void
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(200)
            ->assertJsonPath('id', $this->user->id)
            ->assertJsonPath('email', 'test@test.com')
            ->assertJsonPath('tenant_id', $this->tenant->id);
    }

    /** @test */
    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/me');
        $response->assertStatus(401);
    }

    /** @test */
    public function test_logout_invalidates_token(): void
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/v1/auth/logout');
        $response->assertStatus(200);

        // ログアウト後はトークンが無効
        $response2 = $this->getJson('/api/v1/me');
        $response2->assertStatus(401);
    }

    /** @test */
    public function test_login_records_last_login_at(): void
    {
        $this->assertNull($this->user->last_login_at);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'test@test.com',
            'password' => 'P@ssw0rd!',
            'tenant_slug' => 'test-corp',
        ]);

        $this->assertNotNull($this->user->fresh()->last_login_at);
    }
}
