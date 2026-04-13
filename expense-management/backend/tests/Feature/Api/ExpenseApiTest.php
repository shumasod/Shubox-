<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Infrastructure\Persistence\Eloquent\Models\ApprovalFlowModel;
use App\Infrastructure\Persistence\Eloquent\Models\ApprovalStepModel;
use App\Infrastructure\Persistence\Eloquent\Models\CategoryModel;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use App\Infrastructure\Persistence\Eloquent\Models\RoleModel;
use App\Infrastructure\Persistence\Eloquent\Models\TenantModel;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ExpenseApiTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;
    private UserModel $applicant;
    private UserModel $approver;
    private CategoryModel $category;
    private ApprovalFlowModel $approvalFlow;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestData();
    }

    private function setUpTestData(): void
    {
        // テナント
        $this->tenant = TenantModel::create([
            'id' => Str::uuid(),
            'name' => 'テスト株式会社',
            'slug' => 'test-corp',
            'is_active' => true,
        ]);

        // 役割
        $employeeRole = RoleModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '一般社員',
            'is_system_role' => true,
        ]);

        $managerRole = RoleModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '管理者',
            'is_system_role' => true,
        ]);

        // ユーザー
        $this->applicant = UserModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '山田 太郎',
            'email' => 'yamada@test.com',
            'password' => bcrypt('password'),
            'role_id' => $employeeRole->id,
            'is_active' => true,
        ]);

        $this->approver = UserModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '鈴木 部長',
            'email' => 'suzuki@test.com',
            'password' => bcrypt('password'),
            'role_id' => $managerRole->id,
            'is_active' => true,
        ]);

        // カテゴリ
        $this->category = CategoryModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '交通費',
            'code' => 'TRANSPORT',
            'is_active' => true,
        ]);

        // 承認フロー
        $this->approvalFlow = ApprovalFlowModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => '標準承認フロー',
            'is_default' => true,
            'is_active' => true,
        ]);

        ApprovalStepModel::create([
            'id' => Str::uuid(),
            'approval_flow_id' => $this->approvalFlow->id,
            'step_number' => 1,
            'step_name' => '上長承認',
            'approver_type' => 'specific_user',
            'approver_id' => $this->approver->id,
            'required_count' => 1,
            'allow_delegation' => false,
        ]);
    }

    /** @test */
    public function test_create_expense_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/expenses', []);
        $response->assertStatus(401);
    }

    /** @test */
    public function test_create_expense_returns_201(): void
    {
        $this->actingAs($this->applicant);

        $response = $this->postJson('/api/v1/expenses', [
            'title' => '大阪出張費',
            'description' => 'テスト出張',
            'currency' => 'JPY',
            'items' => [
                [
                    'category_id' => $this->category->id,
                    'description' => '新幹線代',
                    'amount' => 14060,
                    'expense_date' => '2024-01-15',
                    'vendor' => 'JR東海',
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'expense_number',
                'title',
                'total_amount',
                'status',
                'items',
            ])
            ->assertJson([
                'title' => '大阪出張費',
                'status' => 'draft',
                'total_amount' => 14060,
            ]);
    }

    /** @test */
    public function test_create_expense_validates_required_fields(): void
    {
        $this->actingAs($this->applicant);

        $response = $this->postJson('/api/v1/expenses', [
            'description' => 'タイトルなし',
            'items' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'items']);
    }

    /** @test */
    public function test_create_expense_validates_item_amount(): void
    {
        $this->actingAs($this->applicant);

        $response = $this->postJson('/api/v1/expenses', [
            'title' => 'テスト',
            'items' => [
                [
                    'category_id' => $this->category->id,
                    'description' => 'テスト明細',
                    'amount' => 0, // 0円は不正
                    'expense_date' => '2024-01-15',
                ],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.amount']);
    }

    /** @test */
    public function test_list_expenses_returns_paginated_results(): void
    {
        $this->actingAs($this->applicant);

        // 3件作成
        for ($i = 1; $i <= 3; $i++) {
            ExpenseModel::create([
                'id' => Str::uuid(),
                'tenant_id' => $this->tenant->id,
                'applicant_id' => $this->applicant->id,
                'expense_number' => "EXP-2401-{$i}",
                'title' => "経費申請{$i}",
                'total_amount' => 1000 * $i,
                'currency' => 'JPY',
                'status' => 'draft',
                'current_step' => 0,
            ]);
        }

        $response = $this->getJson('/api/v1/expenses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['total', 'per_page', 'current_page', 'last_page'],
            ])
            ->assertJson([
                'meta' => ['total' => 3],
            ]);
    }

    /** @test */
    public function test_list_expenses_filters_by_status(): void
    {
        $this->actingAs($this->applicant);

        ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => '下書き申請',
            'total_amount' => 1000,
            'currency' => 'JPY',
            'status' => 'draft',
            'current_step' => 0,
        ]);

        ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-2',
            'title' => '申請中',
            'total_amount' => 2000,
            'currency' => 'JPY',
            'status' => 'pending',
            'current_step' => 1,
        ]);

        $response = $this->getJson('/api/v1/expenses?status=draft');

        $response->assertStatus(200)
            ->assertJson(['meta' => ['total' => 1]])
            ->assertJsonPath('data.0.status', 'draft');
    }

    /** @test */
    public function test_get_expense_detail(): void
    {
        $this->actingAs($this->applicant);

        $expense = ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => 'テスト申請',
            'total_amount' => 5000,
            'currency' => 'JPY',
            'status' => 'draft',
            'current_step' => 0,
        ]);

        $response = $this->getJson("/api/v1/expenses/{$expense->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $expense->id)
            ->assertJsonPath('title', 'テスト申請')
            ->assertJsonPath('can_edit', true)
            ->assertJsonPath('can_submit', true);
    }

    /** @test */
    public function test_cannot_access_other_tenant_expense(): void
    {
        $otherTenant = TenantModel::create([
            'id' => Str::uuid(),
            'name' => '別テナント',
            'slug' => 'other-tenant',
            'is_active' => true,
        ]);

        $role = RoleModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $otherTenant->id,
            'name' => '一般',
            'is_system_role' => false,
        ]);

        $otherUser = UserModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $otherTenant->id,
            'name' => '他社ユーザー',
            'email' => 'other@other.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        $expense = ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => '別テナントからアクセス不可',
            'total_amount' => 1000,
            'currency' => 'JPY',
            'status' => 'draft',
            'current_step' => 0,
        ]);

        $this->actingAs($otherUser);
        $response = $this->getJson("/api/v1/expenses/{$expense->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function test_approve_expense(): void
    {
        $this->actingAs($this->approver);

        $expense = ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => '承認テスト',
            'total_amount' => 10000,
            'currency' => 'JPY',
            'status' => 'pending',
            'approval_flow_id' => $this->approvalFlow->id,
            'current_step' => 1,
        ]);

        $response = $this->postJson("/api/v1/expenses/{$expense->id}/approve", [
            'comment' => '承認します',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('approval_records', [
            'expense_id' => $expense->id,
            'action' => 'approved',
        ]);
    }

    /** @test */
    public function test_reject_expense_requires_comment(): void
    {
        $this->actingAs($this->approver);

        $expense = ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => '却下テスト',
            'total_amount' => 5000,
            'currency' => 'JPY',
            'status' => 'pending',
            'approval_flow_id' => $this->approvalFlow->id,
            'current_step' => 1,
        ]);

        // コメントなし
        $response = $this->postJson("/api/v1/expenses/{$expense->id}/reject", []);
        $response->assertStatus(422)->assertJsonValidationErrors(['comment']);

        // コメントが短すぎる
        $response2 = $this->postJson("/api/v1/expenses/{$expense->id}/reject", [
            'comment' => '短い',
        ]);
        $response2->assertStatus(422)->assertJsonValidationErrors(['comment']);
    }

    /** @test */
    public function test_delete_draft_expense(): void
    {
        $this->actingAs($this->applicant);

        $expense = ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => '削除テスト',
            'total_amount' => 1000,
            'currency' => 'JPY',
            'status' => 'draft',
            'current_step' => 0,
        ]);

        $response = $this->deleteJson("/api/v1/expenses/{$expense->id}");
        $response->assertStatus(204);

        $this->assertSoftDeleted('expenses', ['id' => $expense->id]);
    }

    /** @test */
    public function test_cannot_delete_pending_expense(): void
    {
        $this->actingAs($this->applicant);

        $expense = ExpenseModel::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'applicant_id' => $this->applicant->id,
            'expense_number' => 'EXP-2401-1',
            'title' => '申請中は削除不可',
            'total_amount' => 1000,
            'currency' => 'JPY',
            'status' => 'pending',
            'current_step' => 1,
        ]);

        $response = $this->deleteJson("/api/v1/expenses/{$expense->id}");
        $response->assertStatus(422);
    }
}
