<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            // Add specialization_id column
            $table->foreignId('specialization_id')->nullable()->after('user_id')->constrained('specializations')->onDelete('set null');
        });

        // Drop the old specialization string column after migrating data
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('specialization');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            // Add back the specialization string column
            $table->string('specialization')->nullable();
        });

        // Drop the foreign key
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropForeign(['specialization_id']);
            $table->dropColumn('specialization_id');
        });
    }
};
