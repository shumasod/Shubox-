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
            $table->integer('fiscal_year');
            $table->unsignedBigInteger('department_id')->nullable()->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('spent')->default(0);
            $table->string('note', 500)->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'fiscal_year', 'department_id', 'category_id'], 'budgets_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
