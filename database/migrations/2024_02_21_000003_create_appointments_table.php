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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->dateTime('appointment_start');
            $table->dateTime('appointment_end');
            $table->enum('status', ['scheduled', 'approved', 'rejected', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable(); // Patient notes about appointment
            $table->text('doctor_notes')->nullable(); // Doctor notes about appointment
            $table->text('rejection_reason')->nullable();
            $table->dateTime('rescheduled_at')->nullable();
            $table->foreignId('rescheduled_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('patient_id');
            $table->index('doctor_id');
            $table->index('status');
            $table->index('appointment_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
