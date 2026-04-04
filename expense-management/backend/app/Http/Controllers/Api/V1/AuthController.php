<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ログイン
     *
     * @OA\Post(
     *   path="/api/v1/auth/login",
     *   tags={"Auth"},
     *   summary="ログイン",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"email","password","tenant_slug"},
     *       @OA\Property(property="email", type="string", format="email"),
     *       @OA\Property(property="password", type="string"),
     *       @OA\Property(property="tenant_slug", type="string")
     *     )
     *   ),
     *   @OA\Response(response=200, description="Success",
     *     @OA\JsonContent(
     *       @OA\Property(property="access_token", type="string"),
     *       @OA\Property(property="token_type", type="string"),
     *       @OA\Property(property="expires_in", type="integer")
     *     )
     *   )
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'tenant_slug' => ['required', 'string'],
        ]);

        // テナント解決
        $tenant = \App\Infrastructure\Persistence\Eloquent\Models\TenantModel::where('slug', $request->tenant_slug)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            throw ValidationException::withMessages(['tenant_slug' => ['テナントが見つかりません。']]);
        }

        $user = UserModel::where('tenant_id', $tenant->id)
            ->where('email', strtolower($request->email))
            ->where('is_active', true)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['メールアドレスまたはパスワードが正しくありません。']]);
        }

        $user->update(['last_login_at' => now()]);

        // Sanctum トークン発行（有効期限: 24時間）
        $token = $user->createToken('api-token', ['*'], now()->addDay())->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 86400,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tenant_id' => $user->tenant_id,
                'role_id' => $user->role_id,
                'department' => $user->department,
            ],
        ]);
    }

    /**
     * ログアウト
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ログアウトしました。']);
    }

    /**
     * ログインユーザー情報
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role.permissions');
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'employee_code' => $user->employee_code,
            'department' => $user->department,
            'tenant_id' => $user->tenant_id,
            'role' => [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'permissions' => $user->role->permissions->pluck('name'),
            ],
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ]);
    }
}
