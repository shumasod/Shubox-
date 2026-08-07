<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantSettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = Tenant::factory()->create(['settings' => []]);
        $this->admin = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role'      => 'admin',
        ]);
    }

    public function test_show_returns_tenant_settings(): void
    {
        $this->tenant->update(['settings' => ['default_currency' => 'USD']]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/tenant-settings')
            ->assertStatus(200)
            ->assertJsonPath('settings.default_currency', 'USD');
    }

    public function test_update_merges_valid_settings(): void
    {
        $this->actingAs($this->admin)
            ->patchJson('/api/admin/tenant-settings', [
                'default_currency'        => 'EUR',
                'expense_approval_required' => true,
                'max_expense_amount'      => 500000,
            ])
            ->assertStatus(200)
            ->assertJsonPath('settings.default_currency', 'EUR');
    }

    public function test_update_ignores_disallowed_keys(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson('/api/admin/tenant-settings', [
                'injected_field' => 'malicious',
            ]);

        $response->assertStatus(422);
    }

    public function test_reset_key_removes_setting(): void
    {
        $this->tenant->update(['settings' => ['default_currency' => 'GBP']]);

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/tenant-settings/key', ['key' => 'default_currency'])
            ->assertStatus(200);

        $this->assertArrayNotHasKey('default_currency', $this->tenant->fresh()->settings);
    }

    public function test_fiscal_year_month_must_be_valid(): void
    {
        $this->actingAs($this->admin)
            ->patchJson('/api/admin/tenant-settings', ['fiscal_year_start_month' => 13])
            ->assertStatus(422);
    }
}
