<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    private const PERMISSIONS = [
        // Expense permissions
        'expense.view.own'   => '自分の経費申請を閲覧',
        'expense.view.all'   => '全経費申請を閲覧',
        'expense.create'     => '経費申請を作成',
        'expense.edit.own'   => '自分の経費申請を編集',
        'expense.delete.own' => '自分の経費申請を削除',
        'expense.submit'     => '経費申請を提出',
        'expense.cancel'     => '経費申請をキャンセル',
        'expense.approve'    => '経費申請を承認',
        'expense.reject'     => '経費申請を却下',
        'expense.export'     => '経費データをエクスポート',
        // Category permissions
        'category.view'      => 'カテゴリを閲覧',
        'category.manage'    => 'カテゴリを管理',
        // Approval flow permissions
        'approval_flow.view'   => '承認フローを閲覧',
        'approval_flow.manage' => '承認フローを管理',
        // User permissions
        'user.view'   => 'ユーザーを閲覧',
        'user.manage' => 'ユーザーを管理',
        // Report permissions
        'report.view'   => 'レポートを閲覧',
        'report.export' => 'レポートをエクスポート',
    ];

    private const ROLES = [
        'admin' => [
            'name'        => '管理者',
            'permissions' => [
                'expense.view.own', 'expense.view.all', 'expense.create',
                'expense.edit.own', 'expense.delete.own', 'expense.submit',
                'expense.cancel', 'expense.approve', 'expense.reject', 'expense.export',
                'category.view', 'category.manage',
                'approval_flow.view', 'approval_flow.manage',
                'user.view', 'user.manage',
                'report.view', 'report.export',
            ],
        ],
        'approver' => [
            'name'        => '承認者',
            'permissions' => [
                'expense.view.own', 'expense.view.all', 'expense.create',
                'expense.edit.own', 'expense.submit', 'expense.cancel',
                'expense.approve', 'expense.reject',
                'category.view', 'approval_flow.view',
                'user.view', 'report.view',
            ],
        ],
        'employee' => [
            'name'        => '一般社員',
            'permissions' => [
                'expense.view.own', 'expense.create', 'expense.edit.own',
                'expense.delete.own', 'expense.submit', 'expense.cancel',
                'category.view',
            ],
        ],
    ];

    public function run(): void
    {
        $now = now();
        $permissionIds = [];

        foreach (self::PERMISSIONS as $code => $description) {
            $id = Str::uuid()->toString();
            DB::table('permissions')->upsert(
                ['id' => $id, 'code' => $code, 'description' => $description, 'created_at' => $now, 'updated_at' => $now],
                ['code'],
                ['description', 'updated_at']
            );
            $permissionIds[$code] = DB::table('permissions')->where('code', $code)->value('id');
        }

        foreach (self::ROLES as $slug => $roleData) {
            $id = Str::uuid()->toString();
            DB::table('roles')->upsert(
                ['id' => $id, 'slug' => $slug, 'name' => $roleData['name'], 'created_at' => $now, 'updated_at' => $now],
                ['slug'],
                ['name', 'updated_at']
            );
            $roleId = DB::table('roles')->where('slug', $slug)->value('id');

            DB::table('role_permissions')->where('role_id', $roleId)->delete();
            foreach ($roleData['permissions'] as $permCode) {
                if (isset($permissionIds[$permCode])) {
                    DB::table('role_permissions')->insert([
                        'role_id'       => $roleId,
                        'permission_id' => $permissionIds[$permCode],
                        'created_at'    => $now,
                        'updated_at'    => $now,
                    ]);
                }
            }
        }
    }
}
