<?php

declare(strict_types=1);

namespace App\Application\UseCases\User;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use DomainException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    public function execute(
        string $tenantId,
        string $name,
        string $email,
        string $password,
        string $roleId,
        ?string $employeeCode = null,
        ?string $department = null,
        ?string $managerId = null,
    ): User {
        $existing = $this->userRepository->findByEmail($email, $tenantId);
        if ($existing !== null) {
            throw new DomainException('A user with this email already exists.');
        }

        $user = User::create(
            id: Str::uuid()->toString(),
            tenantId: $tenantId,
            name: $name,
            email: $email,
            passwordHash: Hash::make($password),
            roleId: $roleId,
            employeeCode: $employeeCode,
            department: $department,
            managerId: $managerId,
        );

        $this->userRepository->save($user);

        return $user;
    }
}
