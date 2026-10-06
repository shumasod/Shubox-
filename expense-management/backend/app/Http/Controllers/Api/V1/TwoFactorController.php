<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function __construct(private readonly Google2FA $google2fa)
    {
    }

    /** Generate and return a new TOTP secret + provisioning URI for QR code */
    public function setup(): JsonResponse
    {
        $user   = Auth::user();
        $secret = $this->google2fa->generateSecretKey(32);

        $user->update(['two_factor_secret_pending' => encrypt($secret)]);

        $uri = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret,
        );

        return response()->json([
            'secret'           => $secret,
            'provisioning_uri' => $uri,
        ]);
    }

    /** Verify a TOTP code and activate 2FA on the user account */
    public function enable(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'     => 'required|string|size:6',
            'password' => 'required|string',
        ]);

        $user = Auth::user();

        if (!Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Password confirmation failed.'], 403);
        }

        $pending = decrypt($user->two_factor_secret_pending ?? '');

        if (!$this->google2fa->verifyKey($pending, $data['code'])) {
            return response()->json(['message' => 'Invalid TOTP code.'], 422);
        }

        $recoveryCodes = $this->generateRecoveryCodes();

        $user->update([
            'two_factor_secret'          => encrypt($pending),
            'two_factor_secret_pending'  => null,
            'two_factor_recovery_codes'  => encrypt(json_encode($recoveryCodes)),
            'two_factor_enabled_at'      => now(),
        ]);

        return response()->json([
            'message'        => 'Two-factor authentication enabled.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /** Disable 2FA after password confirmation */
    public function disable(Request $request): JsonResponse
    {
        $data = $request->validate(['password' => 'required|string']);
        $user = Auth::user();

        if (!Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Password confirmation failed.'], 403);
        }

        $user->update([
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled_at'     => null,
        ]);

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }

    /** Verify a TOTP code during login challenge */
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string']);
        $user = Auth::user();

        if (!$user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled on this account.'], 422);
        }

        $secret = decrypt($user->two_factor_secret);

        // Check TOTP code
        if ($this->google2fa->verifyKey($secret, $data['code'])) {
            session()->put('two_factor_verified', true);
            return response()->json(['message' => '2FA verified.']);
        }

        // Check recovery codes
        $codes = json_decode(decrypt($user->two_factor_recovery_codes ?? '[]'), true);
        $index = array_search($data['code'], $codes, true);

        if ($index !== false) {
            unset($codes[$index]);
            $user->update(['two_factor_recovery_codes' => encrypt(json_encode(array_values($codes)))]);
            session()->put('two_factor_verified', true);
            return response()->json(['message' => 'Recovery code accepted. Remaining codes: ' . count($codes)]);
        }

        return response()->json(['message' => 'Invalid code.'], 422);
    }

    private function generateRecoveryCodes(int $count = 8): array
    {
        return array_map(
            fn() => sprintf('%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(4))),
            array_fill(0, $count, null)
        );
    }
}
