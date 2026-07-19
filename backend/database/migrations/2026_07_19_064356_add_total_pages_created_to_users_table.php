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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('total_pages_created')->default(0)->after('landing_page_limit');
        });

        // Seed existing counts
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            $user->total_pages_created = $user->landingPages()->count();
            $user->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('total_pages_created');
        });
    }
};
