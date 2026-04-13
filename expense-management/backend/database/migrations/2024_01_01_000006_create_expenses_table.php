<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('applicant_id');
            $table->string('expense_number', 20);
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('total_amount')->default(0)->comment('合計金額（円）');
            $table->char('currency', 3)->default('JPY');
            $table->enum('status', [
                'draft', 'pending', 'partially_approved',
                'approved', 'rejected', 'cancelled', 'paid',
            ])->default('draft');
            $table->timestamp('applied_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->date('due_date')->nullable();
            $table->uuid('approval_flow_id')->nullable();
            $table->unsignedTinyInteger('current_step')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('applicant_id')->references('id')->on('users');
            $table->foreign('approval_flow_id')->references('id')->on('approval_flows')->nullOnDelete();

            $table->unique(['tenant_id', 'expense_number']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'applicant_id', 'status']);
            $table->index(['tenant_id', 'applied_at']);
            $table->index(['tenant_id', 'total_amount']);
            // 全文検索インデックス（MySQL FULLTEXT）
            $table->fullText(['title', 'description']);
        });

        Schema::create('expense_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('expense_id');
            $table->uuid('category_id');
            $table->string('description', 500);
            $table->unsignedBigInteger('amount')->comment('単価（円）');
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->unsignedBigInteger('unit_price');
            $table->date('expense_date');
            $table->string('vendor', 200)->nullable();
            $table->string('purpose', 500)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories');

            $table->index(['expense_id', 'sort_order']);
            $table->index(['expense_id', 'category_id']);
            $table->index('expense_date');
        });

        Schema::create('receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('expense_item_id');
            $table->string('original_filename', 255);
            $table->string('storage_path', 500);
            $table->string('file_type', 10)->nullable();
            $table->unsignedInteger('file_size')->comment('バイト単位');
            $table->string('mime_type', 100);
            $table->text('ocr_text')->nullable();
            $table->unsignedBigInteger('ocr_amount')->nullable();
            $table->date('ocr_date')->nullable();
            $table->string('ocr_vendor', 200)->nullable();
            $table->uuid('uploaded_by');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('expense_item_id')->references('id')->on('expense_items')->cascadeOnDelete();
            $table->foreign('uploaded_by')->references('id')->on('users');

            $table->index('expense_item_id');
            $table->index(['tenant_id', 'created_at']);
        });

        Schema::create('approval_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('expense_id');
            $table->uuid('approval_step_id')->nullable();
            $table->uuid('approver_id');
            $table->enum('action', ['approved', 'rejected', 'delegated']);
            $table->text('comment')->nullable();
            $table->uuid('delegated_to')->nullable();
            $table->timestamp('acted_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
            $table->foreign('approver_id')->references('id')->on('users');

            $table->index(['expense_id', 'acted_at']);
            $table->index(['approver_id', 'acted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_records');
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('expense_items');
        Schema::dropIfExists('expenses');
    }
};
