<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class TenantSettingsController extends Controller
{
    private const ALLOWED_SETTINGS = [
        'company_name',
        'fiscal_year_start_month',
        'default_currency',
        'expense_approval_required',
        'expense_auto_approve_below',
        'receipt_required_above',
        'max_expense_amount',
        'timezone',
        'locale',
        'notification_email',
        'allow_personal_cards',
        'require_project_code',
        'require_vendor',
    ];

    private const SETTING_RULES = [
        'company_name'               => 'string|max:150',
        'fiscal_year_start_month'    => 'integer|min:1|max:12',
        'default_currency'           => 'string|size:3',
        'expense_approval_required'  => 'boolean',
        'expense_auto_approve_below' => 'nullable|numeric|min:0',
        'receipt_required_above'     => 'nullable|numeric|min:0',
        'max_expense_amount'         => 'nullable|numeric|min:0',
        'timezone'                   => 'string|timezone',
        'locale'                     => 'string|in:ja,en,zh',
        'notification_email'         => 'nullable|email',
        'allow_personal_cards'       => 'boolean',
        'require_project_code'       => 'boolean',
        'require_vendor'             => 'boolean',
    ];

    public function show(): JsonResponse
    {
        $tenant = $this->currentTenant();

        return response()->json([
            'id'       => $tenant->id,
            'settings' => $tenant->settings ?? [],
            'plan'     => $tenant->plan,
            'status'   => $tenant->status,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $keys = array_keys($request->only(self::ALLOWED_SETTINGS));

        if (empty($keys)) {
            return response()->json(['message' => 'No valid settings provided.'], 422);
        }

        $rules = array_intersect_key(self::SETTING_RULES, array_flip($keys));
        $validated = $request->validate($rules);

        $tenant = $this->currentTenant();
        $current = $tenant->settings ?? [];

        $tenant->update([
            'settings' => array_merge($current, $validated),
        ]);

        return response()->json([
            'settings' => $tenant->fresh()->settings,
            'updated'  => array_keys($validated),
        ]);
    }

    public function resetKey(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string|in:' . implode(',', self::ALLOWED_SETTINGS),
        ]);

        $tenant = $this->currentTenant();
        $settings = $tenant->settings ?? [];
        unset($settings[$request->key]);

        $tenant->update(['settings' => $settings]);

        return response()->json(['message' => "Setting '{$request->key}' reset to default."]);
    }

    private function currentTenant(): Tenant
    {
        return Tenant::findOrFail(Auth::user()->tenant_id);
    }
}
