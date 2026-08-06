<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add fulltext index on expenses table (MySQL 5.6+ / Aurora MySQL 5.6+)
        // Covers title, description, and expense_number for keyword search
        DB::statement(
            'ALTER TABLE expenses ADD FULLTEXT INDEX ft_expenses_search (title, description, expense_number)'
        );

        // Add fulltext index on expense_items for vendor/description search
        DB::statement(
            'ALTER TABLE expense_items ADD FULLTEXT INDEX ft_items_search (description, vendor_name)'
        );
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE expenses DROP INDEX ft_expenses_search');
        DB::statement('ALTER TABLE expense_items DROP INDEX ft_items_search');
    }
};
