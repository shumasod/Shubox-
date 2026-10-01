<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('expense_id');
            $table->unsignedBigInteger('user_id');
            $table->text('body');
            $table->boolean('is_internal')->default(false); // internal = visible to admins/approvers only
            $table->unsignedBigInteger('parent_id')->nullable(); // thread replies
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
            $table->index(['expense_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_comments');
    }
};
