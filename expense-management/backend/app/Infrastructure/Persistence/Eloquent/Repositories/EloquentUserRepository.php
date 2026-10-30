<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\UserModel;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(string $id, string $tenantId): ?User
    {
        $model = UserModel::where('tenant_id', $tenantId)->find($id);
        return $model ? $this->toDomain($model) : null;
    }

    public function findByEmail(string $email, string $tenantId): ?User
    {
        $model = UserModel::where('tenant_id', $tenantId)
            ->where('email', $email)
            ->first();
        return $model ? $this->toDomain($model) : null;
    }

    public function findAllActive(string $tenantId): array
    {
        return UserModel::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($m) => $this->toDomain($m))
            ->toArray();
    }

    public function save(User $user): void
    {
        $model = UserModel::firstOrNew(['id' => $user->getId()]);
        $model->tenant_id   = $user->getTenantId();
        $model->role_id     = $user->getRoleId();
        $model->name        = $user->getName();
        $model->email       = $user->getEmail();
        $model->department  = $user->getDepartment();
        $model->is_active   = $user->isActive();
        $model->save();
    }

    public function delete(string $id, string $tenantId): void
    {
        UserModel::where('tenant_id', $tenantId)->where('id', $id)->delete();
    }

    private function toDomain(UserModel $model): User
    {
        return new User(
            id:         $model->id,
            tenantId:   $model->tenant_id,
            roleId:     $model->role_id,
            name:       $model->name,
            email:      $model->email,
            department: $model->department,
            isActive:   $model->is_active,
        );
    }
}
