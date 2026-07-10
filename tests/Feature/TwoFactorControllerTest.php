<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
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
    }
}
