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
        Schema::create('landing_pages', function (Blueprint $table) {

            $table->id();

            // User tạo landing page
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Template gốc
            $table->foreignId('template_id')
                ->constrained()
                ->cascadeOnDelete();

            // Tên landing page
            $table->string('title');

            // URL
            $table->string('slug')
                ->unique();

            // Dữ liệu người dùng nhập
            $table->json('data');

            // domain riêng (sau này)
            $table->string('domain')
                ->nullable();

            $table->enum('status', [
                'draft',
                'published'
            ])
            ->default('draft');


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
