<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deposits', function (Blueprint $table) {
            if (!Schema::hasColumn('deposits', 'order_code')) {
                $table->unsignedBigInteger('order_code')->nullable()->unique()->after('code');
            }
            if (!Schema::hasColumn('deposits', 'checkout_url')) {
                $table->string('checkout_url', 1000)->nullable()->after('order_code');
            }
            if (!Schema::hasColumn('deposits', 'qr_code')) {
                $table->text('qr_code')->nullable()->after('checkout_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('deposits', function (Blueprint $table) {
            $table->dropColumn(['order_code', 'checkout_url', 'qr_code']);
        });
    }
};
