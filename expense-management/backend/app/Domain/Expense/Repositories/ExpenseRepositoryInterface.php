<?php

declare(strict_types=1);

namespace App\Domain\Expense\Repositories;

use App\Domain\Expense\Entities\Expense;

interface ExpenseRepositoryInterface
{
    public function findById(string $id, string $tenantId): ?Expense;

    public function findByNumber(string $expenseNumber, string $tenantId): ?Expense;

    /**
     * @param array{
     *   status?: string,
     *   applicant_id?: string,
     *   category_id?: string,
     *   date_from?: string,
     *   date_to?: string,
     *   amount_min?: int,
     *   amount_max?: int,
     *   keyword?: string,
     * } $filters
     * @return array{data: Expense[], total: int, per_page: int, current_page: int}
     */
    public function search(string $tenantId, array $filters, int $perPage = 20, int $page = 1): array;

    public function save(Expense $expense): void;

    public function delete(string $id, string $tenantId): void;

    public function nextSequence(string $tenantId, string $yearMonth): int;

    /**
     * 承認待ち一覧（承認者ID指定）
     * @return Expense[]
     */
    public function findPendingForApprover(string $approverId, string $tenantId): array;

    /**
     * CSVエクスポート用（全件取得）
     * @param array<string, mixed> $filters
     * @return iterable<Expense>
     */
    public function cursor(string $tenantId, array $filters): iterable;
}
