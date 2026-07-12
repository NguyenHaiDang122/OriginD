<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_fields', function (Blueprint $table) {

            $table->id();

            $table->foreignId('template_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('label');

            $table->string('key')->unique();

            $table->enum('type', [
                'text',
                'textarea',
                'image',
                'link',
                'number',
                'color',
                'select',
                'checkbox',
                'repeater'
            ]);

            $table->json('default_value')->nullable();

            $table->boolean('required')->default(false);

            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_fields');
    }
};