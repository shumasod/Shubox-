<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Models\CommentModel;
use App\Infrastructure\Persistence\Eloquent\Models\ReceiptModel;
use Aws\Textract\TextractClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessReceiptOcr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(
        private readonly string $receiptId,
    ) {}

    public function handle(TextractClient $textract): void
    {
        $receipt = ReceiptModel::find($this->receiptId);

        if (!$receipt) {
            return;
        }

        try {
            $result = $textract->detectDocumentText([
                'Document' => [
                    'S3Object' => [
                        'Bucket' => config('filesystems.disks.s3.bucket'),
                        'Name'   => $receipt->file_path,
                    ],
                ],
            ]);

            $text  = $this->extractText($result);
            $ocr   = $this->parseExpenseData($text);

            $receipt->update([
                'ocr_result'    => $ocr,
                'ocr_processed' => true,
            ]);

            // コメントとして OCR 結果を経費申請に追加
            if (!empty($ocr['amount']) || !empty($ocr['vendor'])) {
                $body = $this->buildOcrComment($ocr);
                CommentModel::create([
                    'id'         => Str::uuid()->toString(),
                    'expense_id' => $receipt->expense_id,
                    'user_id'    => null, // system comment
                    'parent_id'  => null,
                    'body'       => $body,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('OCR processing failed', [
                'receipt_id' => $this->receiptId,
                'error'      => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function extractText(array $result): string
    {
        $lines = [];
        foreach ($result['Blocks'] ?? [] as $block) {
            if ($block['BlockType'] === 'LINE') {
                $lines[] = $block['Text'];
            }
        }
        return implode("\n", $lines);
    }

    private function parseExpenseData(string $text): array
    {
        $data = ['raw_text' => $text];

        // 金額の抽出 (例: ¥1,234 / 1,234円)
        if (preg_match('/[¥\\\\]\s*([\d,]+)|([\d,]+)\s*円/u', $text, $m)) {
            $amountStr      = $m[1] ?: $m[2];
            $data['amount'] = (int) str_replace(',', '', $amountStr);
        }

        // 日付の抽出 (例: 2024/01/15 / 2024年1月15日)
        if (preg_match('/(\d{4})[/\-年](\d{1,2})[/\-月](\d{1,2})/u', $text, $m)) {
            $data['date'] = sprintf('%04d-%02d-%02d', $m[1], $m[2], $m[3]);
        }

        // 店舗名は最初の非空行を候補とする
        $firstLine = trim(explode("\n", $text)[0] ?? '');
        if (!empty($firstLine)) {
            $data['vendor'] = mb_substr($firstLine, 0, 100);
        }

        return $data;
    }

    private function buildOcrComment(array $ocr): string
    {
        $lines = ['**[OCR 読み取り結果]**'];
        if (!empty($ocr['vendor'])) {
            $lines[] = "- 支払先: {$ocr['vendor']}";
        }
        if (!empty($ocr['amount'])) {
            $lines[] = '- 金額: ¥' . number_format($ocr['amount']);
        }
        if (!empty($ocr['date'])) {
            $lines[] = "- 日付: {$ocr['date']}";
        }
        $lines[] = '';
        $lines[] = '*内容を確認のうえ、必要に応じて修正してください。*';
        return implode("\n", $lines);
    }
}
