<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExportExpensesCsv implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries = 2;

    private const CHUNK_SIZE = 500;
    private const HEADER_ROW = [
        'ID', 'Title', 'Amount', 'Currency', 'Category',
        'Status', 'Submitted At', 'Approved At', 'Submitted By',
        'Department', 'Project Code', 'Description',
    ];

    public function __construct(
        private readonly int $tenantId,
        private readonly int $requestedByUserId,
        private readonly array $filters = [],
        private readonly string $exportId = '',
    ) {
        $this->exportId = $exportId ?: Str::uuid()->toString();
    }

    public function handle(): void
    {
        $s3Key = "exports/{$this->tenantId}/{$this->exportId}.csv";
        $tmpPath = sys_get_temp_dir() . "/{$this->exportId}.csv";

        try {
            $this->writeCsvToTemp($tmpPath);
            $this->uploadToS3($tmpPath, $s3Key);
            $this->notifyUser($s3Key);
        } finally {
            if (file_exists($tmpPath)) {
                unlink($tmpPath);
            }
        }
    }

    private function writeCsvToTemp(string $path): void
    {
        $handle = fopen($path, 'w');

        if ($handle === false) {
            throw new \RuntimeException("Cannot open temp file: {$path}");
        }

        // BOM for Excel UTF-8 compatibility
        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, self::HEADER_ROW);

        $query = Expense::query()
            ->where('tenant_id', $this->tenantId)
            ->with(['submittedBy:id,name', 'department:id,name'])
            ->orderBy('id');

        $this->applyFilters($query);

        $query->chunk(self::CHUNK_SIZE, function ($expenses) use ($handle) {
            foreach ($expenses as $expense) {
                fputcsv($handle, [
                    $expense->id,
                    $expense->title,
                    number_format($expense->amount, 2, '.', ''),
                    $expense->currency,
                    $expense->category,
                    $expense->status,
                    $expense->submitted_at?->toIso8601String(),
                    $expense->approved_at?->toIso8601String(),
                    $expense->submittedBy?->name,
                    $expense->department?->name,
                    $expense->project_code,
                    $expense->description,
                ]);
            }
        });

        fclose($handle);
    }

    private function uploadToS3(string $localPath, string $s3Key): void
    {
        Storage::disk('s3')->put(
            $s3Key,
            file_get_contents($localPath),
            [
                'ServerSideEncryption' => 'aws:kms',
                'ContentType'          => 'text/csv; charset=UTF-8',
                'ContentDisposition'   => 'attachment; filename="expenses.csv"',
            ]
        );
    }

    private function notifyUser(string $s3Key): void
    {
        $user = User::find($this->requestedByUserId);

        if (! $user) {
            return;
        }

        // Generate presigned URL valid for 1 hour
        $url = Storage::disk('s3')->temporaryUrl($s3Key, now()->addHour());

        $user->notify(new \App\Notifications\ExpenseExportReady(
            exportId: $this->exportId,
            downloadUrl: $url,
            expiresAt: now()->addHour(),
        ));

        Log::info('Expense export ready', [
            'export_id' => $this->exportId,
            'user_id'   => $this->requestedByUserId,
            's3_key'    => $s3Key,
        ]);
    }

    private function applyFilters(\Illuminate\Database\Eloquent\Builder $query): void
    {
        if (! empty($this->filters['status'])) {
            $query->whereIn('status', (array) $this->filters['status']);
        }
        if (! empty($this->filters['date_from'])) {
            $query->whereDate('submitted_at', '>=', $this->filters['date_from']);
        }
        if (! empty($this->filters['date_to'])) {
            $query->whereDate('submitted_at', '<=', $this->filters['date_to']);
        }
        if (! empty($this->filters['category'])) {
            $query->where('category', $this->filters['category']);
        }
        if (! empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Expense export job failed', [
            'export_id' => $this->exportId,
            'tenant_id' => $this->tenantId,
            'error'     => $exception->getMessage(),
        ]);
    }
}
