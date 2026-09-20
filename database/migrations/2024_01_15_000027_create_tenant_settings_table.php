<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->unique();
            $table->string('default_currency', 3)->default('JPY');
            $table->unsignedTinyInteger('fiscal_year_start_month')->default(1);
            $table->unsignedBigInteger('auto_approve_below')->nullable()->comment('Auto-approve expenses below this amount in lowest currency unit');
            $table->unsignedBigInteger('require_receipt_above')->nullable();
            $table->boolean('allow_draft_edit_after_submit')->default(false);
            $table->boolean('require_department')->default(false);
            $table->json('notification_channels')->nullable()->comment('Enabled channels: email, slack, in_app');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
