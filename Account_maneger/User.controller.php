<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Create a new user account.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function createAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Delete a user account.
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function deleteAccount(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
