<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use League\Csv\Writer;
use SplTempFileObject;

class ExportExpensesCsv implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 300;

    public function __construct(
        private readonly int    $tenantId,
        private readonly int    $requestedByUserId,
        private readonly array  $filters = [],
        private readonly string $exportId = '',
    ) {}

    public function handle(): void
    {
        $csv = Writer::createFromFileObject(new SplTempFileObject());
        $csv->insertOne([
            'ID', 'Title', 'Amount', 'Currency', 'Category', 'Status',
            'Submitted By', 'Submitted At', 'Approved At', 'Paid At', 'Description',
        ]);

        Expense::query()
            ->where('tenant_id', $this->tenantId)
            ->with(['user:id,name', 'category:id,name'])
            ->when(isset($this->filters['status']), fn ($q) => $q->where('status', $this->filters['status']))
            ->when(isset($this->filters['from']), fn ($q) => $q->whereDate('created_at', '>=', $this->filters['from']))
            ->when(isset($this->filters['to']),   fn ($q) => $q->whereDate('created_at', '<=', $this->filters['to']))
            ->orderBy('created_at', 'desc')
            ->chunk(500, function ($expenses) use ($csv) {
                foreach ($expenses as $expense) {
                    $csv->insertOne([
                        $expense->id,
                        $expense->title,
                        number_format($expense->amount / 100, 2),
                        $expense->currency ?? 'JPY',
                        $expense->category?->name ?? '',
                        $expense->status,
                        $expense->user?->name ?? '',
                        $expense->created_at?->toDateString() ?? '',
                        $expense->approved_at?->toDateString() ?? '',
                        $expense->paid_at?->toDateString() ?? '',
                        $expense->description ?? '',
                    ]);
                }
            });

        $path = "exports/tenant_{$this->tenantId}/expenses_{$this->exportId}.csv";
        Storage::disk('s3')->put($path, $csv->toString(), [
            'ContentType'        => 'text/csv; charset=UTF-8',
            'ContentDisposition' => 'attachment; filename="expenses.csv"',
            'ServerSideEncryption' => 'aws:kms',
        ]);

        // Notify the requesting user
        $user = User::find($this->requestedByUserId);
        if ($user) {
            $presignedUrl = Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(60));
            $user->notify(new \App\Notifications\ExportReadyNotification($presignedUrl));
        }
    }
}
