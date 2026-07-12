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
        Schema::table('template_fields', function (Blueprint $table) {

            $table->string('html_tag')->nullable();

            $table->string('attribute')
                ->default('text');

            $table->string('placeholder')
                ->nullable();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('template_fields', function (Blueprint $table) {

            $table->dropColumn([
                'html_tag',
                'attribute',
                'placeholder'
            ]);

        });
    }
};
