<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TwoFactorControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'tenant_id' => 1,
            'password'  => Hash::make('password123'),
        ]);
    }

    public function test_setup_returns_secret_and_provisioning_uri(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/2fa/setup');

        $response->assertOk()
            ->assertJsonStructure(['secret', 'provisioning_uri']);

        $this->assertNotNull($this->user->fresh()->totp_secret);
    }

    public function test_setup_fails_when_already_enabled(): void
    {
        $this->user->update(['totp_enabled' => true]);

        $this->actingAs($this->user)
            ->postJson('/api/2fa/setup')
            ->assertUnprocessable();
    }

    public function test_disable_requires_correct_password(): void
    {
        $this->user->update(['totp_enabled' => true, 'totp_secret' => 'JBSWY3DPEHPK3PXP']);

        $this->actingAs($this->user)
            ->postJson('/api/2fa/disable', ['code' => '000000', 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'パスワードが正しくありません。');
    }

    public function test_backup_code_consumed_on_use(): void
    {
        $plain  = 'ABCD-EFGH';
        $hashed = Hash::make($plain);

        $this->user->update([
            'totp_enabled'      => true,
            'totp_secret'       => 'JBSWY3DPEHPK3PXP',
            'totp_backup_codes' => [$hashed],
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/2fa/verify', ['code' => $plain])
            ->assertOk()
            ->assertJsonPath('backup_code_used', true);

        $this->assertEmpty($this->user->fresh()->totp_backup_codes);
    }
}
