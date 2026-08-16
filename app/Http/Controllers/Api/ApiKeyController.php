<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ApiKeyController extends Controller
{
    public function index(): JsonResponse
    {
        $keys = ApiKey::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'key_prefix', 'scopes', 'expires_at', 'last_used_at', 'is_active', 'created_at']);

        return response()->json(['data' => $keys]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:80',
            'scopes'     => 'required|array|min:1',
            'scopes.*'   => ['string', Rule::in(ApiKey::ALLOWED_SCOPES)],
            'expires_at' => 'nullable|date|after:today',
        ]);

        $tenantId  = Auth::user()->tenant_id;
        $maxKeys   = 10;
        $existing  = ApiKey::forTenant($tenantId)->where('user_id', Auth::id())->count();

        if ($existing >= $maxKeys) {
            return response()->json(['message' => "APIキーは最大{$maxKeys}件まで作成できます"], 422);
        }

        [$key, $rawKey] = ApiKey::generate(
            $tenantId,
            Auth::id(),
            $validated['name'],
            array_unique($validated['scopes']),
            isset($validated['expires_at']) ? \Carbon\Carbon::parse($validated['expires_at']) : null,
        );

        return response()->json([
            'data' => $key,
            'key'  => $rawKey, // Only returned once — never stored plain
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $key = ApiKey::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json(['data' => $key]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $key = ApiKey::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $validated = $request->validate([
            'name'    => 'sometimes|string|max:80',
            'scopes'  => 'sometimes|array|min:1',
            'scopes.*' => ['string', Rule::in(ApiKey::ALLOWED_SCOPES)],
        ]);

        $key->update($validated);

        return response()->json(['data' => $key->fresh()]);
    }

    public function revoke(int $id): JsonResponse
    {
        $key = ApiKey::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $key->update(['is_active' => false]);

        return response()->json(['message' => 'APIキーを無効化しました']);
    }

    public function destroy(int $id): JsonResponse
    {
        $key = ApiKey::forTenant(Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $key->delete();

        return response()->json(null, 204);
    }

    public function listScopes(): JsonResponse
    {
        return response()->json(['data' => ApiKey::ALLOWED_SCOPES]);
    }
}
