<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use App\Infrastructure\Persistence\Eloquent\Models\TenantModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateMonthlyReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int    $tries   = 1;
    public int    $timeout = 300;
    public string $queue   = 'reports';

    public function __construct(
        private readonly string $tenantId,
        private readonly int    $year,
        private readonly int    $month,
    ) {}

    public function handle(): void
    {
        $tenant = TenantModel::findOrFail($this->tenantId);

        $expenses = ExpenseModel::where('tenant_id', $this->tenantId)
            ->whereYear('created_at', $this->year)
            ->whereMonth('created_at', $this->month)
            ->with(['applicant', 'items.category'])
            ->orderBy('created_at')
            ->get();

        $csv = $this->generateCsv($expenses);

        $path = "reports/{$this->tenantId}/{$this->year}-{$this->month:02d}.csv";
        Storage::disk('s3')->put($path, $csv, 'private');

        // レポート生成完了をキャッシュに記録
        Cache::put(
            "report:monthly:{$this->tenantId}:{$this->year}:{$this->month}",
            ['path' => $path, 'generated_at' => now()->toIso8601String()],
            86400
        );

        Log::info('Monthly report generated', [
            'tenant_id' => $this->tenantId,
            'period'    => "{$this->year}-{$this->month:02d}",
            'count'     => $expenses->count(),
            'path'      => $path,
        ]);
    }

    private function generateCsv($expenses): string
    {
        $rows = [
            ['経費番号', '件名', '申請者', '部門', '金額', 'ステータス', '申請日'],
        ];

        foreach ($expenses as $expense) {
            $rows[] = [
                $expense->expense_number,
                $expense->title,
                $expense->applicant?->name ?? '',
                $expense->applicant?->department ?? '',
                $expense->total_amount,
                $expense->status,
                $expense->created_at->format('Y-m-d'),
            ];
        }

        $output = "\xEF\xBB\xBF"; // BOM for Excel
        foreach ($rows as $row) {
            $output .= implode(',', array_map(
                fn($v) => '"' . str_replace('"', '""', (string) $v) . '"',
                $row
            )) . "\r\n";
        }

        return $output;
    }
}
