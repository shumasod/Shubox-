<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TenantSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantSettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $settings = TenantSettings::firstOrCreate(
            ['tenant_id' => $request->user()->tenant_id],
            [
                'default_currency'       => 'JPY',
                'fiscal_year_start_month'=> 1,
                'notification_channels'  => ['email', 'in_app'],
            ]
        );

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'default_currency'              => 'sometimes|string|size:3|in:JPY,USD,EUR,GBP,CNY,KRW,SGD,HKD,AUD,CAD',
            'fiscal_year_start_month'       => 'sometimes|integer|min:1|max:12',
            'auto_approve_below'            => 'nullable|integer|min:0',
            'require_receipt_above'         => 'nullable|integer|min:0',
            'allow_draft_edit_after_submit' => 'sometimes|boolean',
            'require_department'            => 'sometimes|boolean',
            'notification_channels'         => 'sometimes|array',
            'notification_channels.*'       => 'in:email,slack,in_app',
        ]);

        $settings = TenantSettings::updateOrCreate(
            ['tenant_id' => $request->user()->tenant_id],
            $data
        );

        return response()->json(['data' => $settings->fresh()]);
    }
}
