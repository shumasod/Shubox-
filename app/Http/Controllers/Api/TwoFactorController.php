<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    private const BACKUP_CODE_COUNT = 8;
    private const BACKUP_CODE_LENGTH = 10;
    private const TOTP_WINDOW = 1;

    public function __construct(private readonly Google2FA $google2fa) {}

    /**
     * Begin 2FA setup: generate secret and QR code URI.
     * The secret is NOT saved until the user confirms with a valid code.
     */
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json(['message' => '2FA is already enabled'], 409);
        }

        $secret = $this->google2fa->generateSecretKey();
        $qrUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret,
        );

        // Store pending secret in session — not yet activated
        session(['2fa_pending_secret' => $secret]);

        return response()->json([
            'secret' => $secret,
            'qr_url' => $qrUrl,
        ]);
    }

    /**
     * Confirm 2FA setup with a valid TOTP code and activate.
     */
    public function enable(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:6|digits:6']);

        $secret = session('2fa_pending_secret');

        if (! $secret) {
            return response()->json(['message' => 'No pending 2FA setup found'], 422);
        }

        $valid = $this->google2fa->verifyKey($secret, $request->code, self::TOTP_WINDOW);

        if (! $valid) {
            return response()->json(['message' => 'Invalid code'], 422);
        }

        $backupCodes = $this->generateBackupCodes();
        $user = $request->user();

        $user->update([
            'two_factor_secret'  => encrypt($secret),
            'two_factor_enabled' => true,
            'two_factor_backup_codes' => array_map(
                fn(string $code) => Hash::make($code),
                $backupCodes
            ),
        ]);

        session()->forget('2fa_pending_secret');

        return response()->json([
            'backup_codes' => $backupCodes,
            'message'      => '2FA enabled successfully. Save your backup codes now — they will not be shown again.',
        ], 201);
    }

    /**
     * Verify a TOTP code (or backup code) during login challenge.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $user = $request->user();

        if (! $user->two_factor_enabled) {
            return response()->json(['message' => '2FA is not enabled'], 422);
        }

        $code = $request->code;
        $secret = decrypt($user->two_factor_secret);

        // Try TOTP first
        if (strlen($code) === 6 && ctype_digit($code)) {
            if ($this->google2fa->verifyKey($secret, $code, self::TOTP_WINDOW)) {
                $this->markSessionVerified($request);
                return response()->json(['verified' => true]);
            }
        }

        // Try backup codes
        $storedCodes = $user->two_factor_backup_codes ?? [];

        foreach ($storedCodes as $index => $hashed) {
            if (Hash::check($code, $hashed)) {
                // Consume the backup code
                $remaining = array_values(array_filter(
                    $storedCodes,
                    fn($_, $i) => $i !== $index,
                    ARRAY_FILTER_USE_BOTH
                ));
                $user->update(['two_factor_backup_codes' => $remaining]);

                $this->markSessionVerified($request);
                return response()->json(['verified' => true, 'backup_code_used' => true]);
            }
        }

        return response()->json(['message' => 'Invalid code'], 422);
    }

    /**
     * Disable 2FA after re-confirming password.
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 403);
        }

        $user->update([
            'two_factor_secret'       => null,
            'two_factor_enabled'      => false,
            'two_factor_backup_codes' => null,
        ]);

        session()->forget('2fa_verified');

        return response()->json(['message' => '2FA disabled']);
    }

    /**
     * Regenerate backup codes (invalidates old ones).
     */
    public function regenerateBackupCodes(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();

        if (! $user->two_factor_enabled) {
            return response()->json(['message' => '2FA is not enabled'], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 403);
        }

        $backupCodes = $this->generateBackupCodes();

        $user->update([
            'two_factor_backup_codes' => array_map(
                fn(string $code) => Hash::make($code),
                $backupCodes
            ),
        ]);

        return response()->json(['backup_codes' => $backupCodes]);
    }

    private function generateBackupCodes(): array
    {
        return array_map(
            fn() => strtoupper(Str::random(self::BACKUP_CODE_LENGTH)),
            range(1, self::BACKUP_CODE_COUNT)
        );
    }

    private function markSessionVerified(Request $request): void
    {
        $request->session()->put('2fa_verified', true);
        $request->session()->put('2fa_verified_at', now()->toISOString());
    }
}
