<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class GenerateExpensePdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 120;

    public function __construct(
        private readonly int $expenseId,
        private readonly int $requesterId,
    ) {
        $this->onQueue('reports');
    }

    public function handle(): void
    {
        $expense = Expense::with([
            'items',
            'receipts',
            'applicant',
            'approvalRecords.approver',
            'category',
        ])->findOrFail($this->expenseId);

        $pdf = Pdf::loadView('pdf.expense', ['expense' => $expense])
            ->setPaper('a4', 'portrait')
            ->setOption('defaultFont', 'sans-serif')
            ->setOption('isRemoteEnabled', false);

        $filename = sprintf(
            'exports/expense-%s-%s.pdf',
            $expense->expense_number,
            now()->format('YmdHis'),
        );

        Storage::disk('s3')->put($filename, $pdf->output(), 'private');

        $url = Storage::disk('s3')->temporaryUrl($filename, now()->addMinutes(30));

        $requester = User::find($this->requesterId);
        if ($requester) {
            $requester->notify(new \App\Notifications\ExpensePdfReady(
                $expense->expense_number,
                $url,
            ));
        }
    }
}
