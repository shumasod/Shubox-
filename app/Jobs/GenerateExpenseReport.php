<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateExpenseReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;

    public function __construct(
        private readonly int $tenantId,
        private readonly int $userId,
        private readonly array $filters,
        private readonly string $format,
        private readonly string $reportKey,
    ) {}

    public function handle(): void
    {
        $query = DB::table('expenses')
            ->join('users', 'expenses.user_id', '=', 'users.id')
            ->leftJoin('categories', 'expenses.category_id', '=', 'categories.id')
            ->leftJoin('projects', 'expenses.project_id', '=', 'projects.id')
            ->where('expenses.tenant_id', $this->tenantId)
            ->whereNull('expenses.deleted_at')
            ->select(
                'expenses.id',
                'expenses.title',
                'expenses.amount',
                'expenses.currency',
                'expenses.expense_date',
                'expenses.status',
                'users.name as user_name',
                'users.email as user_email',
                'categories.name as category_name',
                'projects.name as project_name',
                'expenses.description',
                'expenses.created_at',
            );

        if (! empty($this->filters['from'])) {
            $query->whereDate('expenses.expense_date', '>=', $this->filters['from']);
        }
        if (! empty($this->filters['to'])) {
            $query->whereDate('expenses.expense_date', '<=', $this->filters['to']);
        }
        if (! empty($this->filters['status'])) {
            $query->where('expenses.status', $this->filters['status']);
        }
        if (! empty($this->filters['category_id'])) {
            $query->where('expenses.category_id', $this->filters['category_id']);
        }
        if (! empty($this->filters['user_id'])) {
            $query->where('expenses.user_id', $this->filters['user_id']);
        }

        $headers = [
            'ID', '件名', '金額', '通貨', '日付', 'ステータス',
            '申請者', 'メール', 'カテゴリ', 'プロジェクト', '説明', '作成日時',
        ];

        $tmpPath = sys_get_temp_dir() . '/' . Str::uuid() . '.csv';
        $fp = fopen($tmpPath, 'w');
        // BOM for Excel compatibility
        fwrite($fp, "\xEF\xBB\xBF");
        fputcsv($fp, $headers);

        $query->orderByDesc('expenses.expense_date')->chunk(500, function ($rows) use ($fp) {
            foreach ($rows as $row) {
                fputcsv($fp, [
                    $row->id, $row->title, $row->amount, $row->currency,
                    $row->expense_date, $row->status, $row->user_name, $row->user_email,
                    $row->category_name, $row->project_name, $row->description, $row->created_at,
                ]);
            }
        });

        fclose($fp);

        $s3Key = "reports/tenant-{$this->tenantId}/{$this->reportKey}.csv";
        Storage::disk('s3')->put(
            $s3Key,
            fopen($tmpPath, 'r'),
            [
                'ContentType'            => 'text/csv; charset=UTF-8',
                'ServerSideEncryption'   => 'aws:kms',
                'ContentDisposition'     => 'attachment; filename="expense-report.csv"',
            ]
        );

        unlink($tmpPath);

        DB::table('expense_reports')
            ->where('report_key', $this->reportKey)
            ->update([
                'status'       => 'completed',
                'file_path'    => $s3Key,
                'completed_at' => now(),
            ]);
    }

    public function failed(\Throwable $e): void
    {
        DB::table('expense_reports')
            ->where('report_key', $this->reportKey)
            ->update(['status' => 'failed']);
    }
}
