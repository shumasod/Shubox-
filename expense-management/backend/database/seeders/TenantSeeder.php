<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $tenantId = Str::uuid()->toString();
        DB::table('tenants')->upsert(
            [
                'id'         => $tenantId,
                'name'       => 'デモ企業株式会社',
                'slug'       => 'demo',
                'plan'       => 'standard',
                'is_active'  => true,
                'settings'   => json_encode(['timezone' => 'Asia/Tokyo', 'currency' => 'JPY', 'fiscal_month_start' => 4]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            ['slug'],
            ['name', 'plan', 'is_active', 'settings', 'updated_at']
        );
        $tenantId = DB::table('tenants')->where('slug', 'demo')->value('id');

        $adminRoleId    = DB::table('roles')->where('slug', 'admin')->value('id');
        $approverRoleId = DB::table('roles')->where('slug', 'approver')->value('id');
        $employeeRoleId = DB::table('roles')->where('slug', 'employee')->value('id');

        $users = [
            ['name' => '管理者 太郎', 'email' => 'admin@demo.example.com',    'role_id' => $adminRoleId,    'department' => '情報システム部'],
            ['name' => '承認者 花子', 'email' => 'approver@demo.example.com', 'role_id' => $approverRoleId, 'department' => '経理部'],
            ['name' => '社員 次郎',   'email' => 'employee@demo.example.com', 'role_id' => $employeeRoleId, 'department' => '営業部'],
        ];

        foreach ($users as $user) {
            DB::table('users')->upsert(
                [
                    'id'         => Str::uuid()->toString(),
                    'tenant_id'  => $tenantId,
                    'role_id'    => $user['role_id'],
                    'name'       => $user['name'],
                    'email'      => $user['email'],
                    'password'   => Hash::make('password'),
                    'department' => $user['department'],
                    'is_active'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                ['email', 'tenant_id'],
                ['name', 'role_id', 'department', 'updated_at']
            );
        }

        $categories = [
            ['name' => '交通費',     'code' => 'TRANSPORT',   'description' => '電車・バス・タクシー等の交通費'],
            ['name' => '宿泊費',     'code' => 'LODGING',     'description' => '出張時の宿泊費'],
            ['name' => '飲食費',     'code' => 'MEAL',        'description' => '会議・接待等の飲食費'],
            ['name' => '消耗品費',   'code' => 'SUPPLIES',    'description' => 'オフィス消耗品等'],
            ['name' => '通信費',     'code' => 'TELECOM',     'description' => '電話・インターネット等の通信費'],
            ['name' => '書籍・教材', 'code' => 'EDUCATION',   'description' => '業務に関する書籍・教材費'],
            ['name' => 'その他',     'code' => 'OTHER',       'description' => '上記に該当しない経費'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->upsert(
                [
                    'id'          => Str::uuid()->toString(),
                    'tenant_id'   => $tenantId,
                    'name'        => $cat['name'],
                    'code'        => $cat['code'],
                    'description' => $cat['description'],
                    'is_active'   => true,
                    'sort_order'  => 0,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
                ['tenant_id', 'code'],
                ['name', 'description', 'is_active', 'updated_at']
            );
        }

        $approverUser = DB::table('users')
            ->where('tenant_id', $tenantId)
            ->where('email', 'approver@demo.example.com')
            ->first();

        $flowId = Str::uuid()->toString();
        DB::table('approval_flows')->upsert(
            [
                'id'          => $flowId,
                'tenant_id'   => $tenantId,
                'name'        => '標準承認フロー',
                'description' => 'すべての経費申請に適用されるデフォルト承認フロー',
                'is_default'  => true,
                'is_active'   => true,
                'conditions'  => json_encode([]),
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            ['tenant_id', 'name'],
            ['description', 'is_default', 'is_active', 'updated_at']
        );
        $flowId = DB::table('approval_flows')
            ->where('tenant_id', $tenantId)
            ->where('name', '標準承認フロー')
            ->value('id');

        DB::table('approval_steps')->upsert(
            [
                'id'               => Str::uuid()->toString(),
                'approval_flow_id' => $flowId,
                'step_number'      => 1,
                'name'             => '経理部承認',
                'approver_type'    => 'specific_user',
                'approver_ids'     => json_encode($approverUser ? [$approverUser->id] : []),
                'is_required'      => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],
            ['approval_flow_id', 'step_number'],
            ['name', 'approver_type', 'approver_ids', 'updated_at']
        );
    }
}
