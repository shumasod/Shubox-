<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\RoleModel;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $users = UserModel::with('role')
            ->where('tenant_id', $tenantId)
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $user     = UserModel::with('role')->where('tenant_id', $tenantId)->findOrFail($id);

        return response()->json(['data' => $this->formatUser($user)]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:255'],
            'password'   => ['required', 'string', 'min:8'],
            'role_id'    => ['required', 'uuid', 'exists:roles,id'],
            'department' => ['nullable', 'string', 'max:100'],
        ]);

        $exists = UserModel::where('tenant_id', $tenantId)
            ->where('email', $validated['email'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'このメールアドレスはすでに登録されています'], 422);
        }

        $user = UserModel::create([
            'id'         => Str::uuid()->toString(),
            'tenant_id'  => $tenantId,
            'role_id'    => $validated['role_id'],
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'department' => $validated['department'] ?? null,
            'is_active'  => true,
        ]);

        $user->load('role');

        return response()->json(['data' => $this->formatUser($user)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $user     = UserModel::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'       => ['sometimes', 'string', 'max:100'],
            'role_id'    => ['sometimes', 'uuid', 'exists:roles,id'],
            'department' => ['nullable', 'string', 'max:100'],
            'is_active'  => ['boolean'],
            'password'   => ['nullable', 'string', 'min:8'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        $user->load('role');

        return response()->json(['data' => $this->formatUser($user)]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId  = $request->attributes->get('tenant_id');
        $currentId = $request->user()->id;

        if ($id === $currentId) {
            return response()->json(['message' => '自分自身は削除できません'], 422);
        }

        $user = UserModel::where('tenant_id', $tenantId)->findOrFail($id);
        $user->update(['is_active' => false]);

        return response()->json(null, 204);
    }

    private function formatUser(UserModel $model): array
    {
        return [
            'id'          => $model->id,
            'name'        => $model->name,
            'email'       => $model->email,
            'department'  => $model->department,
            'is_active'   => $model->is_active,
            'role'        => [
                'id'   => $model->role->id,
                'slug' => $model->role->slug,
                'name' => $model->role->name,
            ],
            'last_login_at' => $model->last_login_at?->toIso8601String(),
            'created_at'    => $model->created_at->toIso8601String(),
        ];
    }
}
