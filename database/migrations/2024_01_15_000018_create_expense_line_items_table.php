<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_line_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expense_id')->index();
            $table->string('description');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('quantity', 8, 3)->default(1);
            $table->decimal('amount', 12, 2)->storedAs('unit_price * quantity');
            $table->string('unit')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['expense_id', 'sort_order']);
            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_line_items');
    }
};
