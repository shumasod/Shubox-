<?php

namespace App\Http\Controllers;

use App\Models\User; // Userモデルのインポート
use Illuminate\Http\Request; // Requestクラスのインポート
use Illuminate\Support\Facades\Validator; // Validatorファサードのインポート
use Illuminate\Http\JsonResponse; // JsonResponseクラスのインポート

class UserController extends Controller
{
    /**
     * Create a new user account.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createAccount(Request $request): JsonResponse
    {
        // リクエストのバリデーション
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            // バリデーションエラーの場合
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // ユーザーアカウント作成
        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password')), // パスワードをハッシュ化
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    /**
     * Delete a user account.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAccount(int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (!$user) {
            // ユーザーが見つからない場合
            return response()->json(['message' => 'User not found'], 404);
        }

        // ユーザーアカウント削除
        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
