<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\TenantOnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantOnboardingController extends Controller
{
    public function __construct(private readonly TenantOnboardingService $service) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name'   => 'required|string|max:255',
            'domain'         => 'nullable|string|max:255|unique:tenants,domain',
            'plan'           => 'nullable|in:starter,standard,enterprise',
            'currency'       => 'nullable|string|size:3',
            'fiscal_month'   => 'nullable|integer|between:1,12',
            'timezone'       => 'nullable|string|timezone',
            'language'       => 'nullable|in:ja,en',
            'admin_name'     => 'required|string|max:255',
            'admin_email'    => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:12',
        ]);

        $result = $this->service->onboard($data);

        return response()->json([
            'tenant_id'  => $result['tenant']->id,
            'admin_id'   => $result['admin']->id,
            'message'    => 'Tenant onboarded successfully.',
        ], 201);
    }
}
