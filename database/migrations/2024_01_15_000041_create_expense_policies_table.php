<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_policies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('name');
            $table->json('applies_to_roles');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('max_amount_per_submission')->nullable();
            $table->unsignedBigInteger('max_amount_per_day')->nullable();
            $table->unsignedBigInteger('max_amount_per_month')->nullable();
            $table->boolean('receipt_required')->default(false);
            $table->unsignedBigInteger('receipt_required_above')->nullable();
            $table->boolean('requires_project')->default(false);
            $table->boolean('requires_pre_approval')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
            $table->index(['tenant_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_policies');
    }
};
