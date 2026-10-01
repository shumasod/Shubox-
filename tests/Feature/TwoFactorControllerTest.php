<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
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
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
        ]);
    }

    public function test_setup_returns_secret_and_qr_url(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/user/two-factor/setup');

        $response->assertStatus(200)
            ->assertJsonStructure(['secret', 'qr_url']);
    }

    public function test_setup_returns_409_if_already_enabled(): void
    {
        $this->user->update(['two_factor_enabled' => true]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/user/two-factor/setup');

        $response->assertStatus(409);
    }

    public function test_enable_activates_two_factor_with_valid_code(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $code = $google2fa->getCurrentOtp($secret);

        $this->actingAs($this->user)
            ->withSession(['2fa_pending_secret' => $secret])
            ->postJson('/api/user/two-factor/enable', ['code' => $code])
            ->assertStatus(201)
            ->assertJsonStructure(['backup_codes', 'message']);

        $this->user->refresh();
        $this->assertTrue($this->user->two_factor_enabled);
        $this->assertNotNull($this->user->two_factor_secret);
    }

    public function test_enable_rejects_invalid_code(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $this->actingAs($this->user)
            ->withSession(['2fa_pending_secret' => $secret])
            ->postJson('/api/user/two-factor/enable', ['code' => '000000'])
            ->assertStatus(422);
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
        $this->user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => encrypt('FAKESECRET'),
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/user/two-factor/disable', ['password' => 'wrongpassword'])
            ->assertStatus(403);
    }

    public function test_disable_deactivates_with_correct_password(): void
    {
        $this->user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => encrypt('FAKESECRET'),
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/user/two-factor/disable', ['password' => 'password'])
            ->assertStatus(200);

        $this->user->refresh();
        $this->assertFalse($this->user->two_factor_enabled);
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
