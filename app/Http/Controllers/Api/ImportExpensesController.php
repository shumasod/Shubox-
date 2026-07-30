<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessExpenseImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportExpensesController extends Controller
{
    private const MAX_FILE_SIZE_MB = 5;
    private const REQUIRED_COLUMNS  = ['title', 'amount', 'currency', 'category_code', 'expense_date'];
    private const OPTIONAL_COLUMNS  = ['description', 'project_code', 'department_code', 'vendor_name'];

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:csv,txt',
                'max:' . (self::MAX_FILE_SIZE_MB * 1024),
            ],
        ]);

        $file = $request->file('file');

        // Server-side MIME check
        if (!in_array($file->getMimeType(), ['text/csv', 'text/plain', 'application/csv'], true)) {
            return response()->json(['message' => 'CSVファイルのみアップロード可能です'], 422);
        }

        $tenantId = Auth::user()->tenant_id;
        $importId = Str::uuid()->toString();
        $s3Key    = "imports/{$tenantId}/{$importId}.csv";

        Storage::disk('s3')->put($s3Key, $file->getContent(), [
            'ServerSideEncryption' => 'aws:kms',
            'ContentType'          => 'text/csv',
        ]);

        // Peek first 2 rows to validate headers
        $preview = $this->parsePreview($file->getPathname());
        if (is_string($preview)) {
            return response()->json(['message' => $preview], 422);
        }

        ProcessExpenseImport::dispatch(
            $importId,
            $s3Key,
            $tenantId,
            Auth::id(),
        )->onQueue('imports');

        return response()->json([
            'import_id'        => $importId,
            'row_preview'      => $preview,
            'estimated_minutes' => 2,
            'status'           => 'queued',
        ], 202);
    }

    public function status(string $importId): JsonResponse
    {
        $tenantId = Auth::user()->tenant_id;

        $record = \DB::table('expense_imports')
            ->where('id', $importId)
            ->where('tenant_id', $tenantId)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'import_id'     => $record->id,
            'status'        => $record->status,
            'total_rows'    => $record->total_rows,
            'imported_rows' => $record->imported_rows,
            'failed_rows'   => $record->failed_rows,
            'errors'        => $record->errors ? json_decode($record->errors, true) : [],
            'completed_at'  => $record->completed_at,
        ]);
    }

    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $columns = array_merge(self::REQUIRED_COLUMNS, self::OPTIONAL_COLUMNS);
        $header  = implode(',', $columns);
        $example = '交通費,3500,JPY,TRANSPORT,2024-01-15,東京出張,PROJECT_A,ENGINEERING,JR東日本';

        return response()->streamDownload(
            function () use ($header, $example) {
                echo "\xEF\xBB\xBF"; // UTF-8 BOM for Excel
                echo $header . "\n";
                echo $example . "\n";
            },
            'expense_import_template.csv',
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }

    private function parsePreview(string $path): array|string
    {
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return 'ファイルを読み込めませんでした';
        }

        // Strip BOM if present
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            fseek($handle, 0);
        }

        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            return 'CSVヘッダーを読み込めませんでした';
        }

        $headers = array_map('trim', array_map('strtolower', $headers));
        $missing = array_diff(self::REQUIRED_COLUMNS, $headers);
        if (!empty($missing)) {
            fclose($handle);
            return '必須列が不足しています: ' . implode(', ', $missing);
        }

        $preview = [];
        $count   = 0;
        while (($row = fgetcsv($handle)) !== false && $count < 3) {
            $preview[] = array_combine($headers, array_slice($row, 0, count($headers)));
            $count++;
        }

        fclose($handle);
        return $preview;
    }
}
