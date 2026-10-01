<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_can_request_verification_email(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create(['tenant_id' => 1]);

        $this->actingAs($user)
            ->postJson('/api/email/verify/send')
            ->assertOk()
            ->assertJsonPath('message', 'Verification email sent.');

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_already_verified_user_gets_appropriate_response(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);

        $this->actingAs($user)
            ->postJson('/api/email/verify/send')
            ->assertOk()
            ->assertJsonPath('message', 'Email already verified.');
    }

    public function test_valid_signed_url_verifies_email(): void
    {
        $user = User::factory()->unverified()->create(['tenant_id' => 1]);
        $hash = sha1($user->email);

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => $hash]
        );

        $this->actingAs($user)
            ->getJson($url)
            ->assertOk()
            ->assertJsonPath('message', 'Email verified successfully.');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_expired_signed_url_returns_403(): void
    {
        $user = User::factory()->unverified()->create(['tenant_id' => 1]);
        $hash = sha1($user->email);

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinute(),
            ['id' => $user->id, 'hash' => $hash]
        );

        $this->actingAs($user)
            ->getJson($url)
            ->assertStatus(403);
    }
}
