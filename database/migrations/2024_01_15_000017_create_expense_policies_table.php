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
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('role')->nullable();
            $table->decimal('max_amount', 12, 2)->nullable();
            $table->decimal('monthly_limit', 12, 2)->nullable();
            $table->boolean('requires_receipt_above')->default(false);
            $table->decimal('receipt_threshold', 12, 2)->nullable();
            $table->boolean('requires_manager_note_above')->default(false);
            $table->decimal('manager_note_threshold', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active', 'priority']);
            $table->foreign('category_id')->references('id')->on('expense_categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_policies');
    }
};
