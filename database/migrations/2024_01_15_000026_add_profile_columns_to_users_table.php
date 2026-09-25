<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('timezone', 50)->default('Asia/Tokyo')->after('email');
            $table->string('locale', 10)->default('ja')->after('timezone');
            $table->string('avatar_url')->nullable()->after('locale');
            $table->unsignedBigInteger('department_id')->nullable()->after('avatar_url');

            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['timezone', 'locale', 'avatar_url', 'department_id']);
        });
    }
};
