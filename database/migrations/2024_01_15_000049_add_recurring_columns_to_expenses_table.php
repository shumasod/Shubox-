<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false)->after('description');
            $table->unsignedBigInteger('recurring_parent_id')->nullable()->after('is_recurring');
            $table->date('next_recurrence_date')->nullable()->after('recurring_parent_id');

            $table->index(['is_recurring', 'next_recurrence_date']);
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['is_recurring', 'recurring_parent_id', 'next_recurrence_date']);
        });
    }
};
