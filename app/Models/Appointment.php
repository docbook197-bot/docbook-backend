<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_start',
        'appointment_end',
        'status',
        'notes',
        'doctor_notes',
        'rejection_reason',
        'rescheduled_at',
        'rescheduled_by',
    ];

    protected $casts = [
        'appointment_start' => 'datetime',
        'appointment_end' => 'datetime',
        'rescheduled_at' => 'datetime',
    ];

    /**
     * Get the patient associated with the appointment.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the doctor associated with the appointment.
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the user who rescheduled this appointment.
     */
    public function rescheduledBy()
    {
        return $this->belongsTo(User::class, 'rescheduled_by');
    }

    /**
     * Approve an appointment (for doctors).
     */
    public function approve()
    {
        $this->status = 'approved';
        return $this->save();
    }

    /**
     * Reject an appointment.
     */
    public function reject($reason = null)
    {
        $this->status = 'rejected';
        $this->rejection_reason = $reason;
        return $this->save();
    }

    /**
     * Complete an appointment (mark as completed).
     */
    public function complete($doctorNotes = null)
    {
        $this->status = 'completed';
        if ($doctorNotes) {
            $this->doctor_notes = $doctorNotes;
        }
        return $this->save();
    }

    /**
     * Cancel an appointment.
     */
    public function cancel()
    {
        $this->status = 'cancelled';
        return $this->save();
    }

    /**
     * Reschedule the appointment to a new time.
     */
    public function reschedule($newDateTime, $userId)
    {
        // Check if doctor is available at new time
        if ($this->doctor->hasAppointmentAt($newDateTime)) {
            return false;
        }

        $this->appointment_start = $newDateTime;
        $this->appointment_end = $newDateTime->copy()->addMinutes($this->doctor->consultation_duration);
        $this->rescheduled_at = now();
        $this->rescheduled_by = $userId;
        $this->status = 'scheduled';

        return $this->save();
    }

    /**
     * Check if appointment is upcoming.
     */
    public function isUpcoming()
    {
        return $this->appointment_start > now();
    }

    /**
     * Check if appointment is in the past.
     */
    public function isPast()
    {
        return $this->appointment_end < now();
    }
}
