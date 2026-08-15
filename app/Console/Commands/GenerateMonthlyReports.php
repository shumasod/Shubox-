<?php

namespace App\Console\Commands;

use App\Jobs\GenerateExpenseReport;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GenerateMonthlyReports extends Command
{
    protected $signature = 'reports:generate-monthly
                            {--month= : Target month in YYYY-MM format (defaults to previous month)}
                            {--tenant= : Generate only for this tenant ID}';

    protected $description = 'Dispatch monthly expense report generation jobs for all active tenants';

    public function handle(): int
    {
        $month = $this->option('month')
            ? Carbon::createFromFormat('Y-m', $this->option('month'))->startOfMonth()
            : now()->subMonth()->startOfMonth();

        $from = $month->toDateString();
        $to   = $month->copy()->endOfMonth()->toDateString();

        $this->info("Generating monthly reports for {$from} → {$to}");

        $query = DB::table('tenants')
            ->where('is_active', true)
            ->select('id');

        if ($tenantId = $this->option('tenant')) {
            $query->where('id', $tenantId);
        }

        $tenants = $query->get();

        if ($tenants->isEmpty()) {
            $this->warn('No active tenants found.');
            return self::SUCCESS;
        }

        $dispatched = 0;

        foreach ($tenants as $tenant) {
            // Find the finance admin or first admin for this tenant
            $user = DB::table('users')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->whereIn('role', ['finance', 'admin'])
                ->orderByRaw("FIELD(role, 'finance', 'admin')")
                ->value('id');

            if (! $user) {
                $this->warn("Tenant {$tenant->id}: no finance/admin user found, skipping.");
                continue;
            }

            $reportKey = Str::uuid()->toString();
            $filters   = ['from' => $from, 'to' => $to];

            DB::table('expense_reports')->insert([
                'tenant_id'    => $tenant->id,
                'requested_by' => $user,
                'report_key'   => $reportKey,
                'format'       => 'csv',
                'filters'      => json_encode($filters),
                'status'       => 'pending',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            GenerateExpenseReport::dispatch(
                $tenant->id,
                $user,
                $filters,
                'csv',
                $reportKey
            )->onQueue('reports');

            $dispatched++;
            $this->line("  ✓ Tenant {$tenant->id} → {$reportKey}");
        }

        $this->info("Dispatched {$dispatched} report job(s).");

        return self::SUCCESS;
    }
}
