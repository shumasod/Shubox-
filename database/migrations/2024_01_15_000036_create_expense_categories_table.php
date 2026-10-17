<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('name');
            $table->string('code', 32);
            $table->string('color', 7)->default('#6B7280');
            $table->string('icon', 64)->nullable();
            $table->boolean('requires_receipt')->default(false);
            $table->unsignedInteger('receipt_threshold_amount')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
            $table->foreign('parent_id')->references('id')->on('expense_categories')->nullOnDelete();
            $table->index(['tenant_id', 'is_active']);
        });

        Schema::create('category_budget_allocations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('category_id');
            $table->unsignedSmallInteger('fiscal_year');
            $table->unsignedTinyInteger('fiscal_month')->nullable();
            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('JPY');
            $table->timestamps();

            $table->unique(['category_id', 'fiscal_year', 'fiscal_month'], 'category_budget_unique');
            $table->foreign('category_id')->references('id')->on('expense_categories')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_budget_allocations');
        Schema::dropIfExists('expense_categories');
    }
};
