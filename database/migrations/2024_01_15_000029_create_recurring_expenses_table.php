<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('user_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('JPY');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('frequency'); // daily, weekly, monthly, quarterly, annual
            $table->unsignedSmallInteger('interval')->default(1);
            $table->date('next_run_date');
            $table->date('end_date')->nullable();
            $table->unsignedInteger('max_occurrences')->nullable();
            $table->unsignedInteger('occurrence_count')->default(0);
            $table->enum('status', ['active', 'paused', 'completed', 'cancelled'])->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status', 'next_run_date']);
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_expenses');
    }
};
