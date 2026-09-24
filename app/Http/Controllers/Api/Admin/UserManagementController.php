<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\UserInvitedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role'   => 'nullable|in:user,manager,admin',
            'status' => 'nullable|in:active,inactive',
            'search' => 'nullable|string|max:100',
        ]);

        $users = User::where('tenant_id', Auth::user()->tenant_id)
            ->when($request->role,   fn($q) => $q->where('role', $request->role))
            ->when($request->status, fn($q) => $q->where('is_active', $request->status === 'active'))
            ->when($request->search, fn($q) => $q->where(function ($sq) use ($request) {
                $sq->where('name', 'like', "%{$request->search}%")
                   ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->select('id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'created_at')
            ->orderBy('name')
            ->paginate(20);

        return response()->json($users);
    }

    public function invite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:user,manager',
        ]);

        $tempPassword = Str::password(16);

        $user = User::create([
            'tenant_id'  => Auth::user()->tenant_id,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'role'       => $data['role'],
            'password'   => Hash::make($tempPassword),
            'is_active'  => true,
            'invited_by' => Auth::id(),
            'invited_at' => now(),
        ]);

        $user->notify(new UserInvitedNotification($tempPassword));

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
            'message' => 'Invitation email sent.',
        ], 201);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $this->authorizeUser($user);
        abort_if($user->id === Auth::id(), 403, 'Cannot change your own role.');

        $data = $request->validate(['role' => 'required|in:user,manager,admin']);

        $user->update($data);

        return response()->json(['id' => $user->id, 'role' => $user->role]);
    }

    public function deactivate(User $user): JsonResponse
    {
        $this->authorizeUser($user);
        abort_if($user->id === Auth::id(), 403, 'Cannot deactivate yourself.');

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json(['message' => 'User deactivated and sessions revoked.']);
    }

    public function reactivate(User $user): JsonResponse
    {
        $this->authorizeUser($user);
        $user->update(['is_active' => true]);

        return response()->json(['message' => 'User reactivated.']);
    }

    private function authorizeUser(User $user): void
    {
        abort_unless($user->tenant_id === Auth::user()->tenant_id, 404);
        abort_if($user->role === 'admin' && Auth::user()->role !== 'admin', 403);
    }
}
