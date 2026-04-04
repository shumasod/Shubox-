<?php

declare(strict_types=1);

namespace App\Domain\User\Entities;

use DateTimeImmutable;
use InvalidArgumentException;

class User
{
    public function __construct(
        private readonly string $id,
        private readonly string $tenantId,
        private string $name,
        private string $email,
        private string $passwordHash,
        private ?string $employeeCode,
        private ?string $department,
        private string $roleId,
        private ?string $managerId,
        private bool $isActive,
        private ?DateTimeImmutable $lastLoginAt,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function create(
        string $id,
        string $tenantId,
        string $name,
        string $email,
        string $passwordHash,
        string $roleId,
        ?string $employeeCode = null,
        ?string $department = null,
        ?string $managerId = null,
    ): self {
        if (empty(trim($name))) {
            throw new InvalidArgumentException('User name cannot be empty.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email address: {$email}");
        }

        return new self(
            id: $id,
            tenantId: $tenantId,
            name: $name,
            email: strtolower($email),
            passwordHash: $passwordHash,
            employeeCode: $employeeCode,
            department: $department,
            roleId: $roleId,
            managerId: $managerId,
            isActive: true,
            lastLoginAt: null,
            createdAt: new DateTimeImmutable(),
        );
    }

    public function recordLogin(): void
    {
        $this->lastLoginAt = new DateTimeImmutable();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
    }

    public function activate(): void
    {
        $this->isActive = true;
    }

    public function updateProfile(string $name, ?string $department): void
    {
        if (empty(trim($name))) {
            throw new InvalidArgumentException('Name cannot be empty.');
        }
        $this->name = $name;
        $this->department = $department;
    }

    public function changeRole(string $roleId): void
    {
        $this->roleId = $roleId;
    }

    // Getters
    public function getId(): string { return $this->id; }
    public function getTenantId(): string { return $this->tenantId; }
    public function getName(): string { return $this->name; }
    public function getEmail(): string { return $this->email; }
    public function getPasswordHash(): string { return $this->passwordHash; }
    public function getEmployeeCode(): ?string { return $this->employeeCode; }
    public function getDepartment(): ?string { return $this->department; }
    public function getRoleId(): string { return $this->roleId; }
    public function getManagerId(): ?string { return $this->managerId; }
    public function isActive(): bool { return $this->isActive; }
    public function getLastLoginAt(): ?DateTimeImmutable { return $this->lastLoginAt; }
    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }
}
