<?php

declare(strict_types=1);

namespace App\Domain\Expense\Entities;

use DateTimeImmutable;
use InvalidArgumentException;

class Receipt
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public function __construct(
        private readonly string $id,
        private readonly string $tenantId,
        private readonly string $expenseItemId,
        private readonly string $originalFilename,
        private readonly string $storagePath,
        private readonly string $mimeType,
        private readonly int $fileSize,
        private readonly string $uploadedBy,
        private ?string $ocrText,
        private ?int $ocrAmount,
        private ?DateTimeImmutable $ocrDate,
        private ?string $ocrVendor,
        private readonly DateTimeImmutable $createdAt,
    ) {
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new InvalidArgumentException("Unsupported file type: {$mimeType}");
        }
        if ($fileSize > self::MAX_FILE_SIZE) {
            throw new InvalidArgumentException('File size exceeds 10MB limit.');
        }
    }

    public static function create(
        string $id,
        string $tenantId,
        string $expenseItemId,
        string $originalFilename,
        string $storagePath,
        string $mimeType,
        int $fileSize,
        string $uploadedBy,
    ): self {
        return new self(
            id: $id,
            tenantId: $tenantId,
            expenseItemId: $expenseItemId,
            originalFilename: $originalFilename,
            storagePath: $storagePath,
            mimeType: $mimeType,
            fileSize: $fileSize,
            uploadedBy: $uploadedBy,
            ocrText: null,
            ocrAmount: null,
            ocrDate: null,
            ocrVendor: null,
            createdAt: new DateTimeImmutable(),
        );
    }

    public function applyOcrResult(
        ?string $text,
        ?int $amount,
        ?DateTimeImmutable $date,
        ?string $vendor,
    ): void {
        $this->ocrText = $text;
        $this->ocrAmount = $amount;
        $this->ocrDate = $date;
        $this->ocrVendor = $vendor;
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mimeType, 'image/');
    }

    public function isPdf(): bool
    {
        return $this->mimeType === 'application/pdf';
    }

    public function hasOcrData(): bool
    {
        return $this->ocrText !== null;
    }

    // Getters
    public function getId(): string { return $this->id; }
    public function getTenantId(): string { return $this->tenantId; }
    public function getExpenseItemId(): string { return $this->expenseItemId; }
    public function getOriginalFilename(): string { return $this->originalFilename; }
    public function getStoragePath(): string { return $this->storagePath; }
    public function getMimeType(): string { return $this->mimeType; }
    public function getFileSize(): int { return $this->fileSize; }
    public function getUploadedBy(): string { return $this->uploadedBy; }
    public function getOcrText(): ?string { return $this->ocrText; }
    public function getOcrAmount(): ?int { return $this->ocrAmount; }
    public function getOcrDate(): ?DateTimeImmutable { return $this->ocrDate; }
    public function getOcrVendor(): ?string { return $this->ocrVendor; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
