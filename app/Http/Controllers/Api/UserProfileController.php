<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    private const ALLOWED_TIMEZONES = [
        'Asia/Tokyo', 'Asia/Osaka', 'America/New_York', 'America/Los_Angeles',
        'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
        'UTC',
    ];

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('department:id,name');

        return response()->json([
            'data' => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'role'          => $user->role,
                'timezone'      => $user->timezone ?? 'Asia/Tokyo',
                'locale'        => $user->locale ?? 'ja',
                'avatar_url'    => $user->avatar_url,
                'department'    => $user->department,
                'two_factor_enabled' => (bool) $user->two_factor_enabled,
                'created_at'    => $user->created_at,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'     => 'sometimes|string|max:100',
            'timezone' => ['sometimes', Rule::in(self::ALLOWED_TIMEZONES)],
            'locale'   => 'sometimes|in:ja,en',
        ]);

        $user->update($data);

        return response()->json(['data' => $user->fresh()]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();
        $file = $request->file('avatar');

        // Delete old avatar
        if ($user->avatar_url) {
            $oldKey = parse_url($user->avatar_url, PHP_URL_PATH);
            Storage::disk('s3')->delete(ltrim($oldKey, '/'));
        }

        $key = sprintf(
            'avatars/%d/%s.%s',
            $user->id,
            Str::uuid(),
            $file->getClientOriginalExtension()
        );

        Storage::disk('s3')->put($key, $file->getContent(), [
            'ServerSideEncryption' => 'aws:kms',
            'ContentType'          => $file->getMimeType(),
            'CacheControl'         => 'public, max-age=31536000',
        ]);

        $avatarUrl = Storage::disk('s3')->url($key);
        $user->update(['avatar_url' => $avatarUrl]);

        return response()->json(['data' => ['avatar_url' => $avatarUrl]]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:12|confirmed|different:current_password',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 403);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all other sessions
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password updated. Other sessions have been logged out.']);
    }
}
