<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\ExpenseImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use League\Csv\Statement;

class ImportExpensesCsv implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries   = 2;

    private const REQUIRED_HEADERS = ['title', 'amount', 'expense_date', 'currency'];
    private const MAX_ROWS = 5000;

    public function __construct(
        private readonly int    $importId,
        private readonly int    $tenantId,
        private readonly int    $userId,
        private readonly string $s3Key,
    ) {}

    public function handle(): void
    {
        $import = ExpenseImport::findOrFail($this->importId);
        $import->update(['status' => 'processing']);

        try {
            $csv     = $this->loadCsv();
            $headers = $this->validateHeaders($csv);
            $rows    = Statement::create()->process($csv);

            $created = 0;
            $skipped = 0;
            $errors  = [];
            $rowNum  = 1;

            foreach ($rows as $row) {
                if ($rowNum > self::MAX_ROWS) {
                    $errors[] = "Import capped at " . self::MAX_ROWS . " rows.";
                    break;
                }

                $result = $this->processRow($row, $rowNum);

                if ($result === 'created') {
                    $created++;
                } elseif ($result === 'skipped') {
                    $skipped++;
                } else {
                    $errors[] = $result;
                }

                $rowNum++;
            }

            $import->update([
                'status'        => 'completed',
                'rows_created'  => $created,
                'rows_skipped'  => $skipped,
                'error_details' => $errors ?: null,
                'completed_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('ImportExpensesCsv failed', [
                'import_id' => $this->importId,
                'error'     => $e->getMessage(),
            ]);
            $import->update(['status' => 'failed', 'error_details' => [$e->getMessage()]]);
            throw $e;
        } finally {
            Storage::disk('s3')->delete($this->s3Key);
        }
    }

    private function loadCsv(): Reader
    {
        $content = Storage::disk('s3')->get($this->s3Key);
        $csv     = Reader::createFromString($content);
        $csv->setHeaderOffset(0);
        return $csv;
    }

    private function validateHeaders(Reader $csv): array
    {
        $headers = $csv->getHeader();
        $missing = array_diff(self::REQUIRED_HEADERS, $headers);
        if ($missing) {
            throw new \InvalidArgumentException(
                'Missing required CSV columns: ' . implode(', ', $missing)
            );
        }
        return $headers;
    }

    private function processRow(array $row, int $rowNum): string
    {
        $amount = filter_var($row['amount'] ?? '', FILTER_VALIDATE_FLOAT);
        if ($amount === false || $amount <= 0) {
            return "Row {$rowNum}: invalid amount '" . ($row['amount'] ?? '') . "'";
        }

        $date = $row['expense_date'] ?? '';
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return "Row {$rowNum}: invalid date '{$date}' (expected YYYY-MM-DD)";
        }

        $title = trim($row['title'] ?? '');
        if ($title === '') {
            return "Row {$rowNum}: title is required";
        }

        // Dedup by external_id if provided
        $externalId = trim($row['external_id'] ?? '');
        if ($externalId !== '') {
            $exists = Expense::where('tenant_id', $this->tenantId)
                ->where('external_id', $externalId)
                ->exists();
            if ($exists) {
                return 'skipped';
            }
        }

        Expense::create([
            'tenant_id'    => $this->tenantId,
            'user_id'      => $this->userId,
            'title'        => $title,
            'amount'       => $amount,
            'currency'     => strtoupper(substr($row['currency'] ?? 'JPY', 0, 3)),
            'expense_date' => $date,
            'description'  => $row['description'] ?? null,
            'status'       => 'pending',
            'external_id'  => $externalId ?: null,
        ]);

        return 'created';
    }
}
