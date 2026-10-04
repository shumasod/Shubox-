<?php

namespace App\Console;

use App\Jobs\GenerateMonthlyReport;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Purge soft-deleted expenses older than 90 days (daily at 02:00 JST)
        $schedule->command('expense:purge-trash --days=90')
            ->dailyAt('17:00') // 02:00 JST = 17:00 UTC
            ->withoutOverlapping()
            ->runInBackground()
            ->appendOutputTo(storage_path('logs/schedule.log'));

        // Monthly cost report — generated on 1st of each month at 06:00 JST
        $schedule->call(function () {
            $prevMonth = now()->subMonth();
            GenerateMonthlyReport::dispatch(
                $prevMonth->year,
                $prevMonth->month
            );
        })
            ->monthlyOn(1, '21:00') // 06:00 JST = 21:00 UTC previous day
            ->name('monthly-report')
            ->withoutOverlapping();

        // Clean up expired Sanctum tokens (daily at 03:00 JST)
        $schedule->command('sanctum:prune-expired --hours=168') // 7 days
            ->dailyAt('18:00')
            ->withoutOverlapping();

        // Clear expired webhook deliveries older than 30 days (weekly)
        $schedule->command('db:query', [
            "DELETE FROM webhook_deliveries WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)",
        ])
            ->weekly()
            ->sundays()
            ->at('19:00')
            ->withoutOverlapping();

        // Sync budget spent amounts from approved expenses (every 15 minutes)
        $schedule->command('budget:sync-spent')
            ->everyFifteenMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Queue monitor — restart stuck workers if queue depth exceeds threshold
        $schedule->command('queue:monitor default,emails,reports,notifications --max=500')
            ->everyFiveMinutes();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
