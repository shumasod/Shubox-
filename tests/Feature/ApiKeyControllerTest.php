<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiKeyControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        $this->actingAs($this->user);
    }

    public function test_can_create_api_key(): void
    {
        $response = $this->postJson('/api/api-keys', [
            'name'   => 'CI Integration',
            'scopes' => ['expenses:read', 'reports:read'],
        ])->assertCreated();

        $this->assertArrayHasKey('key', $response->json());
        $this->assertStringStartsWith('sxk_', $response->json('key'));
    }

    public function test_raw_key_not_in_subsequent_responses(): void
    {
        $create = $this->postJson('/api/api-keys', [
            'name'   => 'Test Key',
            'scopes' => ['expenses:read'],
        ])->assertCreated();

        $id = $create->json('data.id');
        $this->getJson("/api/api-keys/{$id}")
            ->assertOk()
            ->assertJsonMissingPath('key');
    }

    public function test_invalid_scope_returns_422(): void
    {
        $this->postJson('/api/api-keys', [
            'name'   => 'Bad Key',
            'scopes' => ['admin:everything'],
        ])->assertUnprocessable();
    }

    public function test_revoke_sets_inactive(): void
    {
        [$apiKey] = ApiKey::generate(1, $this->user->id, 'Key', ['expenses:read'], null);

        $this->postJson("/api/api-keys/{$apiKey->id}/revoke")->assertOk();
        $this->assertFalse(ApiKey::find($apiKey->id)->is_active);
    }

    public function test_cannot_access_other_users_key(): void
    {
        $other = User::factory()->create(['tenant_id' => 1]);
        [$apiKey] = ApiKey::generate(1, $other->id, 'Other Key', ['expenses:read'], null);

        $this->getJson("/api/api-keys/{$apiKey->id}")->assertNotFound();
    }
}
