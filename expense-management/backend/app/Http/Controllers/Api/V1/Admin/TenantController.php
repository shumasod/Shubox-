<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\TenantModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $tenant   = TenantModel::findOrFail($tenantId);

        return response()->json(['data' => $this->format($tenant)]);
    }

    public function update(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $tenant   = TenantModel::findOrFail($tenantId);

        $validated = $request->validate([
            'name'                           => ['sometimes', 'string', 'max:100'],
            'settings'                       => ['sometimes', 'array'],
            'settings.timezone'              => ['string', 'timezone'],
            'settings.currency'              => ['string', 'in:JPY,USD,EUR'],
            'settings.fiscal_month_start'    => ['integer', 'between:1,12'],
            'settings.expense_limit_per_item'=> ['nullable', 'integer', 'min:0'],
            'settings.require_receipt_above' => ['nullable', 'integer', 'min:0'],
        ]);

        if (isset($validated['settings'])) {
            $existing = $tenant->settings ?? [];
            $validated['settings'] = array_merge($existing, $validated['settings']);
        }

        $tenant->update($validated);

        return response()->json(['data' => $this->format($tenant)]);
    }

    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $userCount     = \App\Infrastructure\Persistence\Eloquent\Models\UserModel
            ::where('tenant_id', $tenantId)->where('is_active', true)->count();
        $expenseCount  = \App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel
            ::where('tenant_id', $tenantId)->count();
        $pendingCount  = \App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel
            ::where('tenant_id', $tenantId)->where('status', 'submitted')->count();
        $monthlyAmount = \App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel
            ::where('tenant_id', $tenantId)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        return response()->json([
            'data' => [
                'active_users'    => $userCount,
                'total_expenses'  => $expenseCount,
                'pending_count'   => $pendingCount,
                'monthly_amount'  => $monthlyAmount,
            ],
        ]);
    }

    private function format(TenantModel $tenant): array
    {
        return [
            'id'         => $tenant->id,
            'name'       => $tenant->name,
            'slug'       => $tenant->slug,
            'plan'       => $tenant->plan,
            'is_active'  => $tenant->is_active,
            'settings'   => $tenant->settings,
            'created_at' => $tenant->created_at->toIso8601String(),
        ];
    }
}
