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

class GenerateExpenseReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;
    public int $tries = 2;

    public function __construct(
        private readonly int $tenantId,
        private readonly int $requestedByUserId,
        private readonly string $reportId,
        private readonly string $format,
        private readonly string $grouping,
        private readonly array $filters = [],
        private readonly bool $includeReceipts = false,
    ) {}

    public function handle(): void
    {
        $data = $this->fetchData();
        $content = $this->render($data);
        $s3Key = $this->upload($content);
        $this->notify($s3Key);
    }

    private function fetchData(): array
    {
        $query = Expense::where('tenant_id', $this->tenantId)
            ->whereBetween('submitted_at', [
                $this->filters['date_from'],
                $this->filters['date_to'],
            ])
            ->with(['submittedBy:id,name', 'department:id,name', 'vendor:id,name']);

        if (! empty($this->filters['status'])) {
            $query->whereIn('status', $this->filters['status']);
        }
        if (! empty($this->filters['category'])) {
            $query->where('category', $this->filters['category']);
        }
        if (! empty($this->filters['department_id'])) {
            $query->where('department_id', $this->filters['department_id']);
        }
        if (! empty($this->filters['project_id'])) {
            $query->where('project_id', $this->filters['project_id']);
        }

        return $query->orderBy('submitted_at')->get()->toArray();
    }

    private function render(array $data): string
    {
        return match ($this->format) {
            'csv'  => $this->renderCsv($data),
            'xlsx' => $this->renderXlsx($data),
            'pdf'  => $this->renderPdf($data),
            default => throw new \InvalidArgumentException("Unsupported format: {$this->format}"),
        };
    }

    private function renderCsv(array $data): string
    {
        $handle = fopen('php://temp', 'r+');
        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, ['ID', 'Title', 'Amount', 'Currency', 'Category', 'Status', 'Submitted By', 'Department', 'Date']);
        foreach ($data as $row) {
            fputcsv($handle, [
                $row['id'], $row['title'],
                number_format($row['amount'], 2, '.', ''),
                $row['currency'], $row['category'], $row['status'],
                $row['submitted_by']['name'] ?? '',
                $row['department']['name'] ?? '',
                $row['submitted_at'],
            ]);
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        return $csv;
    }

    private function renderXlsx(array $data): string
    {
        // Placeholder — real implementation uses PhpSpreadsheet
        return $this->renderCsv($data);
    }

    private function renderPdf(array $data): string
    {
        // Placeholder — real implementation uses DomPDF or wkhtmltopdf via Lambda
        return $this->renderCsv($data);
    }

    private function upload(string $content): string
    {
        $ext = $this->format === 'xlsx' ? 'xlsx' : ($this->format === 'pdf' ? 'pdf' : 'csv');
        $key = "reports/{$this->tenantId}/{$this->reportId}.{$ext}";

        Storage::disk('s3')->put($key, $content, [
            'ServerSideEncryption' => 'aws:kms',
            'ContentType'          => $this->contentType(),
        ]);

        return $key;
    }

    private function notify(string $s3Key): void
    {
        $user = User::find($this->requestedByUserId);
        if (! $user) return;

        $url = Storage::disk('s3')->temporaryUrl($s3Key, now()->addHours(4));

        $user->notify(new \App\Notifications\ReportReady(
            reportId: $this->reportId,
            downloadUrl: $url,
            expiresAt: now()->addHours(4),
        ));
    }

    private function contentType(): string
    {
        return match ($this->format) {
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pdf'  => 'application/pdf',
            default => 'text/csv; charset=UTF-8',
        };
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Report generation failed', [
            'report_id' => $this->reportId,
            'error'     => $e->getMessage(),
        ]);
    }
}
