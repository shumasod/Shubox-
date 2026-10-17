<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_tag_definitions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('name', 50);
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::create('expense_tag_pivot', function (Blueprint $table) {
            $table->unsignedBigInteger('expense_id');
            $table->unsignedBigInteger('tag_id');
            $table->primary(['expense_id', 'tag_id']);

            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
            $table->foreign('tag_id')->references('id')->on('expense_tag_definitions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_tag_pivot');
        Schema::dropIfExists('expense_tag_definitions');
    }
};
