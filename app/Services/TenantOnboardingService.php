<?php

namespace App\Services;

use App\Models\ApprovalFlow;
use App\Models\Department;
use App\Models\ExpenseCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantOnboardingService
{
    private const DEFAULT_CATEGORIES = [
        ['name' => '交通費',        'color' => '#6366f1', 'sort_order' => 1],
        ['name' => '宿泊費',        'color' => '#8b5cf6', 'sort_order' => 2],
        ['name' => '食費・接待費',   'color' => '#ec4899', 'sort_order' => 3],
        ['name' => '消耗品費',      'color' => '#f97316', 'sort_order' => 4],
        ['name' => '通信費',        'color' => '#14b8a6', 'sort_order' => 5],
        ['name' => '会議費',        'color' => '#06b6d4', 'sort_order' => 6],
        ['name' => '書籍・研修費',   'color' => '#84cc16', 'sort_order' => 7],
        ['name' => 'その他',        'color' => '#94a3b8', 'sort_order' => 8],
    ];

    public function onboard(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $tenant = Tenant::create([
                'name'   => $data['company_name'],
                'domain' => $data['domain'] ?? null,
                'plan'   => $data['plan'] ?? 'standard',
                'settings' => [
                    'currency'       => $data['currency'] ?? 'JPY',
                    'fiscal_month'   => $data['fiscal_month'] ?? 4,
                    'timezone'       => $data['timezone'] ?? 'Asia/Tokyo',
                    'language'       => $data['language'] ?? 'ja',
                ],
            ]);

            $admin = User::create([
                'tenant_id' => $tenant->id,
                'name'      => $data['admin_name'],
                'email'     => $data['admin_email'],
                'password'  => Hash::make($data['admin_password']),
                'role'      => 'admin',
                'email_verified_at' => now(),
            ]);

            $this->seedCategories($tenant->id);
            $this->seedDefaultDepartment($tenant->id, $admin->id);
            $this->seedDefaultApprovalFlow($tenant->id);

            return [
                'tenant' => $tenant,
                'admin'  => $admin,
            ];
        });
    }

    private function seedCategories(int $tenantId): void
    {
        $now = now();
        $rows = array_map(fn($cat) => array_merge($cat, [
            'tenant_id'  => $tenantId,
            'is_active'  => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]), self::DEFAULT_CATEGORIES);

        ExpenseCategory::insert($rows);
    }

    private function seedDefaultDepartment(int $tenantId, int $adminId): void
    {
        Department::create([
            'tenant_id'  => $tenantId,
            'name'       => '全社',
            'code'       => 'ALL',
            'manager_id' => $adminId,
            'parent_id'  => null,
            'sort_order' => 0,
        ]);
    }

    private function seedDefaultApprovalFlow(int $tenantId): void
    {
        ApprovalFlow::create([
            'tenant_id'   => $tenantId,
            'name'        => '標準承認フロー',
            'description' => 'デフォルトの一段階承認フロー',
            'is_default'  => true,
            'steps'       => [
                ['step_order' => 1, 'step_name' => '上長承認', 'approver_type' => 'manager', 'is_auto_approve_enabled' => false],
            ],
        ]);
    }
}
