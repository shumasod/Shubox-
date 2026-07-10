<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function __construct(private readonly Google2FA $google2fa) {}

    public function setup(Request $request): JsonResponse
    {
        $user   = $request->user();
        $secret = $this->google2fa->generateSecretKey();

        $user->update(['two_factor_secret_tmp' => encrypt($secret)]);

        $qrUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json([
            'secret' => $secret,
            'qr_url' => $qrUrl,
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|digits:6']);

        $user   = $request->user();
        $secret = decrypt($user->two_factor_secret_tmp);

        if (!$this->google2fa->verifyKey($secret, $request->code)) {
            return response()->json(['message' => 'Invalid TOTP code'], 422);
        }

        $backupCodes = collect(range(1, 8))->map(fn () => Str::upper(Str::random(4) . '-' . Str::random(4)));

        $user->update([
            'two_factor_secret'      => encrypt($secret),
            'two_factor_secret_tmp'  => null,
            'two_factor_enabled'     => true,
            'two_factor_backup_codes'=> encrypt(json_encode($backupCodes->all())),
        ]);

        return response()->json([
            'message'      => 'Two-factor authentication enabled.',
            'backup_codes' => $backupCodes,
        ]);
    }

    public function disable(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 403);
        }

        $user->update([
            'two_factor_secret'       => null,
            'two_factor_enabled'      => false,
            'two_factor_backup_codes' => null,
        ]);

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|min:6|max:8']);

        $user   = $request->user();
        $secret = decrypt($user->two_factor_secret);
        $code   = strtoupper(str_replace('-', '', $request->code));

        // Check TOTP
        if (strlen($code) === 6 && $this->google2fa->verifyKey($secret, $code)) {
            $request->session()->put('two_factor_verified', true);
            return response()->json(['message' => 'Verified']);
        }

        // Check backup code
        $backupCodes = json_decode(decrypt($user->two_factor_backup_codes), true) ?? [];
        $idx = array_search($code, $backupCodes);
        if ($idx !== false) {
            unset($backupCodes[$idx]);
            $user->update(['two_factor_backup_codes' => encrypt(json_encode(array_values($backupCodes)))]);
            $request->session()->put('two_factor_verified', true);
            return response()->json(['message' => 'Verified via backup code', 'remaining_backup_codes' => count($backupCodes)]);
        }

        return response()->json(['message' => 'Invalid code'], 422);
    }
}
