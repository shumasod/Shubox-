<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhooks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('url');
            $table->string('secret', 64);
            $table->json('events');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->unsignedSmallInteger('failure_count')->default(0);
            $table->timestamps();
        });

        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('webhook_id')->index();
            $table->string('event');
            $table->json('payload');
            $table->unsignedSmallInteger('status_code')->nullable();
            $table->boolean('success')->default(false);
            $table->text('response_body')->nullable();
            $table->unsignedSmallInteger('attempt')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhooks');
    }
};
