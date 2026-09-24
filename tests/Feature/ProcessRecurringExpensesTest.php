<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProcessRecurringExpensesTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_new_expense_from_recurring_template(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);

        $templateId = DB::table('expenses')->insertGetId([
            'tenant_id'           => 1,
            'user_id'             => $user->id,
            'title'               => '交通費（毎月）',
            'amount'              => 5000,
            'currency'            => 'JPY',
            'expense_date'        => '2024-01-01',
            'status'              => 'draft',
            'is_recurring'        => true,
            'next_recurrence_date' => '2024-02-01',
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);

        $this->artisan('expenses:process-recurring', ['--date' => '2024-02-01'])
            ->assertSuccessful();

        // New expense created
        $this->assertDatabaseHas('expenses', [
            'recurring_parent_id' => $templateId,
            'expense_date'        => '2024-02-01',
            'is_recurring'        => false,
        ]);

        // Template next date advanced
        $this->assertDatabaseHas('expenses', [
            'id'                   => $templateId,
            'next_recurrence_date' => '2024-03-01',
        ]);
    }

    public function test_skips_templates_not_yet_due(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);

        DB::table('expenses')->insert([
            'tenant_id'            => 1,
            'user_id'              => $user->id,
            'title'                => '家賃',
            'amount'               => 100000,
            'currency'             => 'JPY',
            'expense_date'         => '2024-01-01',
            'status'               => 'draft',
            'is_recurring'         => true,
            'next_recurrence_date' => '2024-03-01',
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        $this->artisan('expenses:process-recurring', ['--date' => '2024-02-01'])
            ->assertSuccessful();

        $this->assertDatabaseMissing('expenses', ['recurring_parent_id' => DB::table('expenses')->value('id')]);
    }
}
