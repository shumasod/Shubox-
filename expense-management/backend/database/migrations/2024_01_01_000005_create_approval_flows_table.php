<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_flows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->unsignedInteger('min_amount')->nullable();
            $table->unsignedInteger('max_amount')->nullable();
            $table->json('category_ids')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->index(['tenant_id', 'is_active']);
            $table->index(['tenant_id', 'is_default']);
        });

        Schema::create('approval_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('approval_flow_id');
            $table->unsignedTinyInteger('step_number');
            $table->string('step_name', 100);
            $table->enum('approver_type', ['specific_user', 'role', 'manager', 'department_head']);
            $table->uuid('approver_id')->nullable();
            $table->uuid('approver_role_id')->nullable();
            $table->unsignedTinyInteger('required_count')->default(1);
            $table->boolean('allow_delegation')->default(false);
            $table->unsignedSmallInteger('deadline_days')->nullable();
            $table->timestamps();

            $table->foreign('approval_flow_id')->references('id')->on('approval_flows')->cascadeOnDelete();
            $table->unique(['approval_flow_id', 'step_number']);
            $table->index('approval_flow_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_steps');
        Schema::dropIfExists('approval_flows');
    }
};
