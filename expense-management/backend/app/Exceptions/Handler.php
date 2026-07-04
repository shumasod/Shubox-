<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = ['current_password', 'password', 'password_confirmation'];

    public function render($request, Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => '入力内容を確認してください',
                'errors'  => $e->errors(),
            ], 422);
        }

        if ($e instanceof ModelNotFoundException) {
            return response()->json(['message' => '指定されたリソースが見つかりません'], 404);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json(['message' => '認証が必要です'], 401);
        }

        if ($e instanceof HttpException) {
            return response()->json(
                ['message' => $e->getMessage() ?: 'エラーが発生しました'],
                $e->getStatusCode()
            );
        }

        $status = 500;
        $message = config('app.debug') ? $e->getMessage() : 'サーバーエラーが発生しました';

        return response()->json(['message' => $message], $status);
    }
}
