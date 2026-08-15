<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'unread_only' => 'nullable|boolean',
            'type'        => 'nullable|string|max:100',
            'per_page'    => 'nullable|integer|min:1|max:50',
        ]);

        $user        = Auth::user();
        $perPage     = $request->integer('per_page', 20);
        $unreadOnly  = $request->boolean('unread_only', false);

        $query = $user->notifications()
            ->when($unreadOnly, fn($q) => $q->whereNull('read_at'))
            ->when($request->filled('type'), fn($q) => $q->where('type', $request->type));

        $notifications = $query->paginate($perPage);

        return response()->json([
            'data'         => $notifications->items(),
            'unread_count' => $user->unreadNotifications()->count(),
            'meta'         => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
            ],
        ]);
    }

    public function markRead(string $id): JsonResponse
    {
        $notification = Auth::user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'id'      => $notification->id,
            'read_at' => $notification->read_at,
        ]);
    }

    public function markAllRead(): JsonResponse
    {
        $count = Auth::user()->unreadNotifications()->count();
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['marked_read' => $count]);
    }

    public function destroy(string $id): JsonResponse
    {
        Auth::user()->notifications()->findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function destroyAll(): JsonResponse
    {
        $count = Auth::user()->notifications()->count();
        Auth::user()->notifications()->delete();
        return response()->json(['deleted' => $count]);
    }
}
