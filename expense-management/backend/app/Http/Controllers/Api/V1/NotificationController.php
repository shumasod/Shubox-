<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\NotificationModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $notifications = NotificationModel::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
                'total'        => $notifications->total(),
                'unread_count' => NotificationModel::where('user_id', $userId)
                    ->whereNull('read_at')
                    ->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        NotificationModel::where('user_id', $userId)
            ->where('id', $id)
            ->update(['read_at' => now()]);

        return response()->json(null, 204);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        NotificationModel::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(null, 204);
    }
}
