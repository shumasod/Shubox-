<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'unread_only' => 'boolean',
            'type'        => 'nullable|string|max:255',
            'per_page'    => 'integer|min:1|max:100',
        ]);

        $user  = Auth::user();
        $query = $user->notifications();

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $perPage       = (int) $request->input('per_page', 20);
        $notifications = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);

        return response()->json(['data' => $notification]);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['data' => $notification]);
    }

    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $count = $user->unreadNotifications()->count();
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message'      => 'All notifications marked as read',
            'marked_count' => $count,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json(null, 204);
    }

    public function destroyRead(): JsonResponse
    {
        $user  = Auth::user();
        $count = $user->readNotifications()->count();
        $user->readNotifications()->delete();

        return response()->json([
            'message'       => 'Read notifications deleted',
            'deleted_count' => $count,
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'unread_count' => Auth::user()->unreadNotifications()->count(),
        ]);
    }
}
