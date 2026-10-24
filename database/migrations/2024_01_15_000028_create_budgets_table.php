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
            $table->string('type')->default('department'); // department, project, category
            $table->unsignedBigInteger('owner_id')->nullable(); // dept/project/category id
            $table->string('owner_type')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('JPY');
            $table->string('period')->default('monthly'); // monthly, quarterly, annual
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('spent_amount', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'exceeded'])->default('active');
            $table->unsignedTinyInteger('alert_threshold')->default(80);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'start_date', 'end_date']);
            $table->index(['tenant_id', 'owner_type', 'owner_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
