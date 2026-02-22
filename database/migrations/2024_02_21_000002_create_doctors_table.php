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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('specialization'); // e.g., Cardiology, Neurology, etc.
            $table->string('hospital_name');
            $table->text('bio')->nullable();
            $table->string('profile_picture_url')->nullable(); // URL to Supabase storage
            $table->string('certificate_url')->nullable(); // URL to Supabase storage
            $table->integer('consultation_duration')->default(30); // in minutes
            $table->decimal('consultation_fee', 8, 2)->nullable();
            $table->boolean('is_approved')->default(true); // Admin approval for doctors
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
