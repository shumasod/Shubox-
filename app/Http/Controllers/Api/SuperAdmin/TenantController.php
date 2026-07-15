<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q'        => 'nullable|string',
            'plan'     => 'nullable|string|in:standard,professional,enterprise',
            'active'   => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $tenants = DB::table('tenants')
            ->whereNull('deleted_at')
            ->when(isset($validated['q']), fn ($q) => $q->where(function ($inner) use ($validated) {
                $inner->where('name', 'like', "%{$validated['q']}%")
                      ->orWhere('slug', 'like', "%{$validated['q']}%");
            }))
            ->when(isset($validated['plan']),   fn ($q) => $q->where('plan', $validated['plan']))
            ->when(isset($validated['active']), fn ($q) => $q->where('is_active', $validated['active']))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 25);

        // Attach user counts
        $ids        = collect($tenants->items())->pluck('id');
        $userCounts = DB::table('users')
            ->whereIn('tenant_id', $ids)
            ->where('is_active', true)
            ->groupBy('tenant_id')
            ->select('tenant_id', DB::raw('COUNT(*) as user_count'))
            ->pluck('user_count', 'tenant_id');

        $items = collect($tenants->items())->map(fn ($t) => [
            ...(array) $t,
            'user_count' => $userCounts[$t->id] ?? 0,
        ]);

        return response()->json(['data' => $items, 'meta' => [
            'total'        => $tenants->total(),
            'per_page'     => $tenants->perPage(),
            'current_page' => $tenants->currentPage(),
            'last_page'    => $tenants->lastPage(),
        ]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'plan'          => 'nullable|string|in:standard,professional,enterprise',
            'max_users'     => 'nullable|integer|between:5,10000',
            'billing_email' => 'nullable|email',
            'timezone'      => 'nullable|string|timezone',
            'trial_ends_at' => 'nullable|date',
        ]);

        $slug = Str::slug($validated['name']);
        if (DB::table('tenants')->where('slug', $slug)->exists()) {
            $slug .= '-' . Str::random(4);
        }

        $id = DB::table('tenants')->insertGetId([
            'name'          => $validated['name'],
            'slug'          => $slug,
            'plan'          => $validated['plan'] ?? 'standard',
            'max_users'     => $validated['max_users'] ?? 50,
            'billing_email' => $validated['billing_email'] ?? null,
            'timezone'      => $validated['timezone'] ?? 'Asia/Tokyo',
            'trial_ends_at' => $validated['trial_ends_at'] ?? null,
            'is_active'     => true,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return response()->json(DB::table('tenants')->find($id), 201);
    }

    public function show(int $id): JsonResponse
    {
        $tenant = DB::table('tenants')->whereNull('deleted_at')->find($id);
        if (! $tenant) return response()->json(['message' => 'Not found.'], 404);

        $stats = [
            'user_count'    => DB::table('users')->where('tenant_id', $id)->where('is_active', true)->count(),
            'expense_count' => DB::table('expenses')->where('tenant_id', $id)->whereNull('deleted_at')->count(),
            'total_amount'  => DB::table('expenses')->where('tenant_id', $id)->whereNull('deleted_at')->sum('amount'),
        ];

        return response()->json(['tenant' => $tenant, 'stats' => $stats]);
    }

    public function suspend(int $id): JsonResponse
    {
        $rows = DB::table('tenants')->whereNull('deleted_at')->where('id', $id)
            ->update(['is_active' => false, 'updated_at' => now()]);

        if ($rows === 0) return response()->json(['message' => 'Not found.'], 404);

        return response()->json(['message' => 'テナントを停止しました。']);
    }

    public function reinstate(int $id): JsonResponse
    {
        $rows = DB::table('tenants')->whereNull('deleted_at')->where('id', $id)
            ->update(['is_active' => true, 'updated_at' => now()]);

        if ($rows === 0) return response()->json(['message' => 'Not found.'], 404);

        return response()->json(['message' => 'テナントを再有効化しました。']);
    }

    public function destroy(int $id): JsonResponse
    {
        $rows = DB::table('tenants')->whereNull('deleted_at')->where('id', $id)
            ->update(['deleted_at' => now(), 'is_active' => false, 'updated_at' => now()]);

        if ($rows === 0) return response()->json(['message' => 'Not found.'], 404);

        return response()->json(null, 204);
    }
}
