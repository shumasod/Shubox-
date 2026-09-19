<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use OTPHP\TOTP;

class TwoFactorController extends Controller
{
    private const BACKUP_CODE_COUNT = 10;

    /**
     * Generate a new TOTP secret and return provisioning URI for QR code.
     * Does NOT enable 2FA yet — user must verify a code first.
     */
    public function setup(): JsonResponse
    {
        $user = Auth::user();

        if ($user->totp_enabled) {
            return response()->json(['message' => '2FAはすでに有効です。'], 422);
        }

        $totp   = TOTP::generate();
        $secret = $totp->getSecret();

        $user->update(['totp_secret' => $secret]);

        $totp->setLabel($user->email);
        $totp->setIssuer(config('app.name'));

        return response()->json([
            'secret'           => $secret,
            'provisioning_uri' => $totp->getProvisioningUri(),
        ]);
    }

    /**
     * Verify a TOTP code and enable 2FA, returning one-time backup codes.
     */
    public function enable(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => 'required|string|size:6',
            'password' => 'required|string',
        ]);

        $user = Auth::user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'パスワードが正しくありません。'], 422);
        }

        if ($user->totp_enabled) {
            return response()->json(['message' => '2FAはすでに有効です。'], 422);
        }

        if (! $user->totp_secret || ! $this->verifyCode($user->totp_secret, $request->code)) {
            return response()->json(['message' => 'コードが無効です。'], 422);
        }

        $plainCodes  = $this->generateBackupCodes();
        $hashedCodes = array_map(fn ($c) => Hash::make($c), $plainCodes);

        $user->update([
            'totp_enabled'      => true,
            'totp_enabled_at'   => now(),
            'totp_backup_codes' => $hashedCodes,
        ]);

        return response()->json([
            'backup_codes' => $plainCodes,
            'message'      => 'バックアップコードは安全な場所に保存してください。再表示されません。',
        ]);
    }

    /**
     * Verify TOTP code during login (called from LoginController).
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $user = Auth::user();

        if (! $user->totp_enabled) {
            return response()->json(['message' => '2FAが有効ではありません。'], 422);
        }

        $code = $request->code;

        // Try TOTP code first
        if ($this->verifyCode($user->totp_secret, $code)) {
            return response()->json(['verified' => true]);
        }

        // Fall back to backup codes — constant-time comparison for each
        $backupCodes  = $user->totp_backup_codes ?? [];
        $matchedIndex = null;

        foreach ($backupCodes as $i => $hashed) {
            if (Hash::check($code, $hashed)) {
                $matchedIndex = $i;
                break;
            }
        }

        if ($matchedIndex !== null) {
            // Consume the backup code
            unset($backupCodes[$matchedIndex]);
            $user->update(['totp_backup_codes' => array_values($backupCodes)]);

            return response()->json(['verified' => true, 'backup_code_used' => true]);
        }

        return response()->json(['message' => 'コードが無効です。'], 422);
    }

    /**
     * Disable 2FA — requires current password and valid TOTP code.
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => 'required|string|size:6',
            'password' => 'required|string',
        ]);

        $user = Auth::user();

        if (! $user->totp_enabled) {
            return response()->json(['message' => '2FAは有効ではありません。'], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'パスワードが正しくありません。'], 422);
        }

        if (! $this->verifyCode($user->totp_secret, $request->code)) {
            return response()->json(['message' => 'コードが無効です。'], 422);
        }

        $user->update([
            'totp_secret'       => null,
            'totp_enabled'      => false,
            'totp_enabled_at'   => null,
            'totp_backup_codes' => null,
        ]);

        return response()->json(['message' => '2FAを無効にしました。']);
    }

    /**
     * Regenerate backup codes — invalidates all existing ones.
     */
    public function regenerateBackupCodes(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = Auth::user();

        if (! $user->totp_enabled) {
            return response()->json(['message' => '2FAが有効ではありません。'], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'パスワードが正しくありません。'], 422);
        }

        $plainCodes  = $this->generateBackupCodes();
        $hashedCodes = array_map(fn ($c) => Hash::make($c), $plainCodes);

        $user->update(['totp_backup_codes' => $hashedCodes]);

        return response()->json(['backup_codes' => $plainCodes]);
    }

    private function verifyCode(string $secret, string $code): bool
    {
        $totp = TOTP::createFromSecret($secret);
        return $totp->verify($code, null, 1); // 1 period leeway
    }

    private function generateBackupCodes(): array
    {
        return array_map(
            fn () => strtoupper(Str::random(4) . '-' . Str::random(4)),
            range(1, self::BACKUP_CODE_COUNT)
        );
    }
}
