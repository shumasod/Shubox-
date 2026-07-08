<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    private const ALLOWED_EVENTS = [
        'expense.submitted', 'expense.approved', 'expense.rejected',
        'expense.paid', 'user.created', '*',
    ];

    public function index(): JsonResponse
    {
        $hooks = Webhook::where('tenant_id', Auth::user()->tenant_id)
            ->withCount('deliveries')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $hooks]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'url'    => 'required|url|max:500',
            'events' => 'required|array|min:1',
            'events.*' => 'string|in:' . implode(',', self::ALLOWED_EVENTS),
        ]);

        $hook = Webhook::create([
            'tenant_id' => Auth::user()->tenant_id,
            'url'       => $data['url'],
            'events'    => array_unique($data['events']),
            'secret'    => Str::random(40),
            'is_active' => true,
        ]);

        return response()->json(['data' => $hook->makeVisible('secret')], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hook = Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'url'       => 'sometimes|url|max:500',
            'events'    => 'sometimes|array|min:1',
            'events.*'  => 'string|in:' . implode(',', self::ALLOWED_EVENTS),
            'is_active' => 'boolean',
        ]);

        $hook->update($data);
        return response()->json(['data' => $hook->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function rotateSecret(int $id): JsonResponse
    {
        $hook = Webhook::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);
        $hook->update(['secret' => Str::random(40), 'failure_count' => 0]);
        return response()->json(['data' => $hook->fresh()->makeVisible('secret')]);
    }
}
