<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    private const ALLOWED_ROLES = ['employee', 'manager', 'admin', 'finance'];

    public function index(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->when($request->filled('search'), fn($q) => $q->where(function ($q2) use ($request) {
                $q2->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('email', 'like', '%' . $request->search . '%');
            }))
            ->when($request->filled('role'), fn($q) => $q->where('role', $request->role))
            ->when($request->filled('department_id'), fn($q) => $q->where('department_id', $request->integer('department_id')))
            ->with('department:id,name')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 30));

        return response()->json($users);
    }

    public function invite(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'email'         => 'required|email|unique:users,email',
            'name'          => 'required|string|max:100',
            'role'          => 'required|in:' . implode(',', self::ALLOWED_ROLES),
            'department_id' => 'nullable|integer|exists:departments,id',
        ]);

        $tempPassword = Str::random(24);

        $user = User::create([
            'tenant_id'     => $tenantId,
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'role'          => $validated['role'],
            'department_id' => $validated['department_id'] ?? null,
            'password'      => Hash::make($tempPassword),
            'force_password_change' => true,
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::where('tenant_id', Auth::user()->tenant_id)
            ->with('department:id,name')
            ->findOrFail($id);

        return response()->json($user->makeHidden(['password', 'remember_token', 'two_factor_secret']));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);

        if ($user->id === Auth::id() && $request->filled('role')) {
            return response()->json(['message' => 'You cannot change your own role.'], 403);
        }

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:100',
            'role'          => 'sometimes|in:' . implode(',', self::ALLOWED_ROLES),
            'department_id' => 'nullable|integer|exists:departments,id',
            'is_active'     => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json($user->fresh()->makeHidden(['password', 'remember_token', 'two_factor_secret']));
    }

    public function suspend(int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'You cannot suspend your own account.'], 403);
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json(['message' => 'User suspended and sessions revoked.']);
    }

    public function reinstate(int $id): JsonResponse
    {
        $user = User::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $user->update(['is_active' => true]);

        return response()->json(['message' => 'User reinstated.']);
    }
}
