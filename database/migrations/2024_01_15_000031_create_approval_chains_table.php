<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_chains', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('conditions')->nullable(); // amount thresholds, categories, departments
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('priority')->default(50);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active', 'priority']);
        });

        Schema::create('approval_chain_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chain_id');
            $table->unsignedTinyInteger('step_order');
            $table->string('approver_type'); // user, role, department_head, any_manager
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->string('approver_label')->nullable();
            $table->unsignedSmallInteger('timeout_hours')->default(48);
            $table->string('escalation_type')->nullable(); // skip, reassign, notify
            $table->unsignedBigInteger('escalation_user_id')->nullable();
            $table->timestamps();

            $table->foreign('chain_id')->references('id')->on('approval_chains')->cascadeOnDelete();
            $table->unique(['chain_id', 'step_order']);
        });

        Schema::create('expense_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expense_id');
            $table->unsignedBigInteger('chain_id');
            $table->unsignedBigInteger('step_id');
            $table->unsignedTinyInteger('step_order');
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'skipped', 'timed_out'])->default('pending');
            $table->text('comment')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamps();

            $table->index(['expense_id', 'step_order']);
            $table->index(['approver_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_approvals');
        Schema::dropIfExists('approval_chain_steps');
        Schema::dropIfExists('approval_chains');
    }
};
