<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Xóa unique hiện tại trên cột key (unique toàn bảng)
        Schema::table('template_fields', function (Blueprint $table) {
            $table->dropUnique('template_fields_key_unique');

            // Thêm unique theo từng template_id
            $table->unique(['template_id', 'key'], 'template_fields_template_id_key_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
