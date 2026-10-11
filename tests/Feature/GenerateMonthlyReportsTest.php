<?php

namespace Tests\Feature;

use App\Jobs\GenerateExpenseReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class GenerateMonthlyReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_dispatches_jobs_for_active_tenants(): void
    {
        Queue::fake();

        // Create tenants and finance users in the DB
        \Illuminate\Support\Facades\DB::table('tenants')->insert([
            ['id' => 1, 'name' => 'Tenant A', 'is_active' => true],
            ['id' => 2, 'name' => 'Tenant B', 'is_active' => false], // inactive — should be skipped
        ]);

        \App\Models\User::factory()->create(['tenant_id' => 1, 'role' => 'finance', 'is_active' => true]);

        $this->artisan('reports:generate-monthly', ['--month' => '2024-01'])
            ->assertSuccessful();

        Queue::assertPushed(GenerateExpenseReport::class, 1);
    }

    public function test_command_skips_tenants_without_finance_user(): void
    {
        Queue::fake();

        \Illuminate\Support\Facades\DB::table('tenants')->insert([
            ['id' => 3, 'name' => 'Tenant C', 'is_active' => true],
        ]);

        // No finance/admin user for tenant 3

        $this->artisan('reports:generate-monthly', ['--month' => '2024-01', '--tenant' => 3])
            ->assertSuccessful();

        Queue::assertNothingPushed();
    }
}
