<?php

declare(strict_types=1);

namespace App\Domain\User\Repositories;

use App\Domain\User\Entities\User;

interface UserRepositoryInterface
{
    public function findById(string $id, string $tenantId): ?User;

    public function findByEmail(string $email, string $tenantId): ?User;

    /**
     * @return array{data: User[], total: int}
     */
    public function search(string $tenantId, array $filters, int $perPage = 20, int $page = 1): array;

    public function save(User $user): void;

    public function delete(string $id, string $tenantId): void;

    /** @return User[] */
    public function findByRole(string $roleId, string $tenantId): array;
}
