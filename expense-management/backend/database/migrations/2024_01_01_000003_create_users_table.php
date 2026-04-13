<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 100);
            $table->string('email', 254);
            $table->string('password');
            $table->string('employee_code', 50)->nullable();
            $table->string('department', 100)->nullable();
            $table->uuid('role_id');
            $table->uuid('manager_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('role_id')->references('id')->on('roles');
            $table->foreign('manager_id')->references('id')->on('users')->nullOnDelete();

            // テナント内メールユニーク
            $table->unique(['tenant_id', 'email']);
            $table->index(['tenant_id', 'is_active']);
            $table->index(['tenant_id', 'department']);
            $table->index(['tenant_id', 'role_id']);
            $table->index('manager_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
