<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('name');
            $table->enum('budget_type', ['department', 'project', 'category', 'user']);
            $table->unsignedBigInteger('target_id')->nullable();
            $table->enum('period_type', ['monthly', 'quarterly', 'annual', 'custom']);
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('JPY');
            $table->unsignedTinyInteger('alert_threshold')->default(80);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['tenant_id', 'budget_type', 'is_active']);
            $table->index(['tenant_id', 'period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
