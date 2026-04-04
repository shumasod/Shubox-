<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Expense;

use App\Domain\Expense\Entities\Receipt;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ReceiptTest extends TestCase
{
    private function makeReceipt(string $mimeType = 'image/jpeg', int $fileSize = 1024): Receipt
    {
        return Receipt::create(
            id: 'receipt-001',
            tenantId: 'tenant-001',
            expenseItemId: 'item-001',
            originalFilename: 'receipt.jpg',
            storagePath: 'tenants/tenant-001/receipts/2024/01/uuid.jpg',
            mimeType: $mimeType,
            fileSize: $fileSize,
            uploadedBy: 'user-001',
        );
    }

    public function test_creates_jpeg_receipt(): void
    {
        $receipt = $this->makeReceipt('image/jpeg');
        $this->assertTrue($receipt->isImage());
        $this->assertFalse($receipt->isPdf());
    }

    public function test_creates_pdf_receipt(): void
    {
        $receipt = $this->makeReceipt('application/pdf');
        $this->assertTrue($receipt->isPdf());
        $this->assertFalse($receipt->isImage());
    }

    public function test_throws_on_unsupported_mime_type(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unsupported file type: application/zip');
        $this->makeReceipt('application/zip');
    }

    public function test_throws_when_file_size_exceeds_limit(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('File size exceeds 10MB limit.');
        $this->makeReceipt('image/jpeg', 10 * 1024 * 1024 + 1);
    }

    public function test_accepts_maximum_file_size(): void
    {
        $receipt = $this->makeReceipt('image/jpeg', 10 * 1024 * 1024);
        $this->assertSame(10 * 1024 * 1024, $receipt->getFileSize());
    }

    public function test_has_no_ocr_data_initially(): void
    {
        $receipt = $this->makeReceipt();
        $this->assertFalse($receipt->hasOcrData());
        $this->assertNull($receipt->getOcrText());
        $this->assertNull($receipt->getOcrAmount());
    }

    public function test_applies_ocr_result(): void
    {
        $receipt = $this->makeReceipt();
        $receipt->applyOcrResult(
            text: 'JR東海 東京→大阪 ¥14,060',
            amount: 14060,
            date: new \DateTimeImmutable('2024-01-15'),
            vendor: 'JR東海',
        );

        $this->assertTrue($receipt->hasOcrData());
        $this->assertSame('JR東海 東京→大阪 ¥14,060', $receipt->getOcrText());
        $this->assertSame(14060, $receipt->getOcrAmount());
        $this->assertSame('JR東海', $receipt->getOcrVendor());
    }

    /**
     * @dataProvider allowedMimeTypesProvider
     */
    public function test_accepts_allowed_mime_types(string $mimeType): void
    {
        $receipt = $this->makeReceipt($mimeType);
        $this->assertNotNull($receipt);
    }

    public static function allowedMimeTypesProvider(): array
    {
        return [
            'JPEG' => ['image/jpeg'],
            'PNG' => ['image/png'],
            'GIF' => ['image/gif'],
            'WebP' => ['image/webp'],
            'PDF' => ['application/pdf'],
        ];
    }
}
