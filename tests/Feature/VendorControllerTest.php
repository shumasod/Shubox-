<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        $this->actingAs($this->user);
    }

    public function test_index_returns_only_tenant_vendors(): void
    {
        Vendor::factory()->create(['tenant_id' => 1, 'name' => 'Vendor A']);
        Vendor::factory()->create(['tenant_id' => 99, 'name' => 'Other Tenant']);

        $response = $this->getJson('/api/vendors')->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_search_filters_by_name(): void
    {
        Vendor::factory()->create(['tenant_id' => 1, 'name' => 'Acme Corp']);
        Vendor::factory()->create(['tenant_id' => 1, 'name' => 'Beta LLC']);

        $response = $this->getJson('/api/vendors?search=Acme')->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_store_creates_vendor(): void
    {
        $this->postJson('/api/vendors', [
            'name'     => 'Test Vendor',
            'email'    => 'vendor@example.com',
            'currency' => 'JPY',
        ])->assertCreated()->assertJsonPath('data.name', 'Test Vendor');
    }

    public function test_duplicate_code_returns_422(): void
    {
        Vendor::factory()->create(['tenant_id' => 1, 'code' => 'VEND001']);

        $this->postJson('/api/vendors', [
            'name' => 'Duplicate',
            'code' => 'VEND001',
        ])->assertUnprocessable();
    }

    public function test_destroy_blocked_when_has_expenses(): void
    {
        $vendor = Vendor::factory()->create(['tenant_id' => 1]);
        // Simulate has expenses via withCount
        $vendor->expenses()->create([
            'tenant_id' => 1, 'user_id' => $this->user->id,
            'title' => 'Test', 'amount' => 1000, 'currency' => 'JPY',
            'category_id' => 1, 'expense_date' => now(), 'status' => 'draft',
        ]);

        $this->deleteJson("/api/vendors/{$vendor->id}")->assertConflict();
    }

    public function test_cross_tenant_returns_404(): void
    {
        $other = Vendor::factory()->create(['tenant_id' => 99]);
        $this->getJson("/api/vendors/{$other->id}")->assertNotFound();
    }
}
