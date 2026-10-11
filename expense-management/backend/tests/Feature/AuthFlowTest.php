<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant     = Tenant::factory()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email'     => 'test@example.com',
            'password'  => Hash::make('SecurePass123!'),
            'role'      => 'employee',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'SecurePass123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email', 'role']]]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'WrongPassword',
        ])->assertStatus(401);
    }

    public function test_login_validates_required_fields(): void
    {
        $this->postJson('/api/v1/auth/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_user_can_logout(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/v1/auth/logout')
            ->assertOk();
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'test@example.com');
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/v1/expenses')
            ->assertUnauthorized();
    }

    public function test_login_response_does_not_expose_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'SecurePass123!',
        ]);

        $this->assertStringNotContainsString('SecurePass123!', $response->content());
        $this->assertStringNotContainsString('password', $response->json('data.user') ? json_encode($response->json('data.user')) : '');
    }

    public function test_concurrent_tokens_are_independent(): void
    {
        $token1 = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com', 'password' => 'SecurePass123!',
        ])->json('data.token');

        $token2 = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com', 'password' => 'SecurePass123!',
        ])->json('data.token');

        $this->assertNotEquals($token1, $token2);

        // Revoking token1 should not affect token2
        $this->withToken($token1)->postJson('/api/v1/auth/logout')->assertOk();
        $this->withToken($token2)->getJson('/api/v1/auth/me')->assertOk();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->user->update(['is_active' => false]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'SecurePass123!',
        ])->assertStatus(403);
    }
}
