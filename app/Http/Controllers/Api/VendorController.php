<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search'   => 'nullable|string|max:100',
            'status'   => 'nullable|in:active,inactive,blocked',
            'category' => 'nullable|string|max:80',
            'per_page' => 'integer|min:1|max:100',
        ]);

        $tenantId = Auth::user()->tenant_id;

        $query = Vendor::forTenant($tenantId)->orderBy('name');

        if ($request->filled('search')) {
            $q = $request->input('search');
            $query->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$q}%")
                ->orWhere('code', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%")
            );
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $vendors = $query->paginate((int) $request->input('per_page', 24));

        return response()->json([
            'data' => $vendors->items(),
            'meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page'    => $vendors->lastPage(),
                'total'        => $vendors->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'name'     => 'required|string|max:150',
            'code'     => ['nullable', 'string', 'max:32',
                           Rule::unique('vendors')->where('tenant_id', $tenantId)->whereNull('deleted_at')],
            'email'    => 'nullable|email|max:150',
            'phone'    => 'nullable|string|max:32',
            'website'  => 'nullable|url|max:255',
            'tax_id'   => 'nullable|string|max:64',
            'currency' => 'nullable|string|size:3',
            'status'   => 'nullable|in:active,inactive,blocked',
            'category' => 'nullable|string|max:80',
            'notes'    => 'nullable|string|max:2000',
        ]);

        $vendor = Vendor::create(array_merge($validated, ['tenant_id' => $tenantId]));

        AuditLog::record('vendor.created', 'Vendor', $vendor->id);

        return response()->json(['data' => $vendor], 201);
    }

    public function show(int $id): JsonResponse
    {
        $vendor = Vendor::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        return response()->json([
            'data' => array_merge($vendor->toArray(), ['spend_stats' => $vendor->spend_stats]),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $vendor   = Vendor::forTenant($tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:150',
            'code'     => ['nullable', 'string', 'max:32',
                           Rule::unique('vendors')->where('tenant_id', $tenantId)->whereNull('deleted_at')->ignore($id)],
            'email'    => 'nullable|email|max:150',
            'phone'    => 'nullable|string|max:32',
            'website'  => 'nullable|url|max:255',
            'tax_id'   => 'nullable|string|max:64',
            'currency' => 'nullable|string|size:3',
            'status'   => 'nullable|in:active,inactive,blocked',
            'category' => 'nullable|string|max:80',
            'notes'    => 'nullable|string|max:2000',
        ]);

        $vendor->update($validated);
        AuditLog::record('vendor.updated', 'Vendor', $id);

        return response()->json(['data' => $vendor->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;
        $vendor   = Vendor::forTenant($tenantId)->withCount('expenses')->findOrFail($id);

        if ($vendor->expenses_count > 0) {
            return response()->json(['message' => '経費が紐付いているため削除できません。無効化を利用してください。'], 409);
        }

        $vendor->delete();
        AuditLog::record('vendor.deleted', 'Vendor', $id);

        return response()->json(null, 204);
    }

    public function categories(): JsonResponse
    {
        $categories = Vendor::forTenant(Auth::user()->tenant_id)
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json(['data' => $categories]);
    }
}
