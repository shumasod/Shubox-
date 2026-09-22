<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('expense_id');
            $table->unsignedBigInteger('processed_by');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('JPY');
            $table->enum('method', ['bank_transfer', 'corporate_card', 'cash', 'other'])->default('bank_transfer');
            $table->string('reference_number')->nullable();
            $table->string('bank_account')->nullable();
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('expense_id')->references('id')->on('expenses');
            $table->index(['tenant_id', 'payment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
