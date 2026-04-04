<?php

declare(strict_types=1);

namespace App\Domain\Approval\Repositories;

use App\Domain\Approval\Entities\ApprovalFlow;

interface ApprovalFlowRepositoryInterface
{
    public function findById(string $id, string $tenantId): ?ApprovalFlow;

    /** @return ApprovalFlow[] */
    public function findByTenant(string $tenantId): array;

    public function findDefault(string $tenantId): ?ApprovalFlow;

    /**
     * 金額・カテゴリに最適なフローを検索
     */
    public function findMatching(string $tenantId, int $amount, ?string $categoryId): ?ApprovalFlow;

    public function save(ApprovalFlow $flow): void;

    public function delete(string $id, string $tenantId): void;
}
