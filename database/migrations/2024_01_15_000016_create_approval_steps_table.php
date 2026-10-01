<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expense_id')->index();
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->unsignedTinyInteger('step_order');
            $table->string('step_name');
            $table->enum('status', ['pending', 'approved', 'rejected', 'skipped'])->default('pending');
            $table->text('comment')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['expense_id', 'step_order']);
            $table->index(['approver_id', 'status']);
            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
            $table->foreign('approver_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_steps');
    }
};
