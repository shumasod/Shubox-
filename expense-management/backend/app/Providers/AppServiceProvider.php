<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Approval\Repositories\ApprovalFlowRepositoryInterface;
use App\Domain\Expense\Repositories\ExpenseRepositoryInterface;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Repositories\EloquentApprovalFlowRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\EloquentExpenseRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\EloquentUserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            ExpenseRepositoryInterface::class,
            EloquentExpenseRepository::class,
        );

        $this->app->bind(
            ApprovalFlowRepositoryInterface::class,
            EloquentApprovalFlowRepository::class,
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class,
        );
    }

    public function boot(): void
    {
        //
    }
}
