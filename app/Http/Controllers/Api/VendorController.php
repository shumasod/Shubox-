<?php

namespace App\Http\Controllers\Api;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vendors = Vendor::forTenant(Auth::user()->tenant_id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->withCount('expenses')
            ->orderBy('name')
            ->paginate(20);

        return response()->json($vendors);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:200',
            'code'          => 'nullable|string|max:50',
            'email'         => 'nullable|email|max:200',
            'phone'         => 'nullable|string|max:30',
            'website'       => 'nullable|url|max:300',
            'address'       => 'nullable|string|max:500',
            'tax_id'        => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:100',
            'currency'      => 'nullable|string|size:3',
            'notes'         => 'nullable|string|max:1000',
        ]);

        $tenantId = Auth::user()->tenant_id;

        if (!empty($validated['code'])) {
            $exists = Vendor::forTenant($tenantId)
                ->where('code', $validated['code'])
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'Vendor code already in use.'], 422);
            }
        }

        $vendor = Vendor::create(array_merge($validated, ['tenant_id' => $tenantId]));

        return response()->json($vendor, 201);
    }

    public function show(int $id): JsonResponse
    {
        $vendor = Vendor::forTenant(Auth::user()->tenant_id)
            ->withCount('expenses')
            ->findOrFail($id);

        return response()->json($vendor);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $vendor = Vendor::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:200',
            'email'         => 'sometimes|nullable|email|max:200',
            'phone'         => 'sometimes|nullable|string|max:30',
            'website'       => 'sometimes|nullable|url|max:300',
            'address'       => 'sometimes|nullable|string|max:500',
            'payment_terms' => 'sometimes|nullable|string|max:100',
            'status'        => 'sometimes|in:active,inactive,blocked',
            'notes'         => 'sometimes|nullable|string|max:1000',
        ]);

        $vendor->update($validated);

        return response()->json($vendor);
    }

    public function destroy(int $id): JsonResponse
    {
        $vendor = Vendor::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        if ($vendor->expenses()->exists()) {
            return response()->json(['message' => 'Cannot delete vendor with linked expenses.'], 409);
        }

        $vendor->delete();
        return response()->json(null, 204);
    }

    public function stats(int $id): JsonResponse
    {
        $vendor = Vendor::forTenant(Auth::user()->tenant_id)->findOrFail($id);

        $stats = DB::table('expenses')
            ->where('vendor_id', $id)
            ->where('tenant_id', Auth::user()->tenant_id)
            ->selectRaw('
                COUNT(*) as total_count,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount,
                MIN(expense_date) as first_expense,
                MAX(expense_date) as last_expense,
                COUNT(CASE WHEN status = \'approved\' THEN 1 END) as approved_count
            ')
            ->first();

        return response()->json([
            'vendor'         => $vendor,
            'total_count'    => (int) $stats->total_count,
            'total_amount'   => (float) $stats->total_amount,
            'avg_amount'     => round((float) $stats->avg_amount, 2),
            'first_expense'  => $stats->first_expense,
            'last_expense'   => $stats->last_expense,
            'approved_count' => (int) $stats->approved_count,
        ]);
    }
}
