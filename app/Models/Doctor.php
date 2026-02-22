<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization_id',
        'hospital_name',
        'bio',
        'profile_picture_url',
        'certificate_url',
        'consultation_duration',
        'consultation_fee',
        'is_approved',
        'rejection_reason',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'consultation_fee' => 'decimal:2',
    ];

    /**
     * Get the user associated with the doctor.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the specialization associated with the doctor.
     */
    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    /**
     * Get all appointments for this doctor.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the availability schedule for this doctor.
     */
    public function availability()
    {
        return $this->hasMany(DoctorAvailability::class);
    }

    /**
     * Check if doctor has an appointment at a specific time.
     */
    public function hasAppointmentAt($dateTime, $duration = null)
    {
        if ($duration === null) {
            $duration = $this->consultation_duration;
        }

        $endTime = $dateTime->copy()->addMinutes($duration);

        return $this->appointments()
            ->whereIn('status', ['scheduled', 'approved', 'completed'])
            ->where(function ($query) use ($dateTime, $endTime) {
                $query->whereRaw('appointment_start < ?', [$endTime])
                      ->whereRaw('appointment_end > ?', [$dateTime]);
            })
            ->exists();
    }

    /**
     * Get available time slots for a specific date.
     */
    public function getAvailableSlots($date, $slotDuration = 30)
    {
        $dayOfWeek = $date->format('l'); // e.g., 'Monday'
        
        $availability = $this->availability()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->first();

        if (!$availability) {
            return [];
        }

        $slots = [];
        $current = $date->copy()->setTimeFromTimeString($availability->start_time);
        $end = $date->copy()->setTimeFromTimeString($availability->end_time);

        while ($current < $end) {
            $slotEnd = $current->copy()->addMinutes($slotDuration);
            
            // Check if this slot is already booked
            if (!$this->hasAppointmentAt($current, $slotDuration)) {
                $slots[] = [
                    'start' => $current->toDateTimeString(),
                    'end' => $slotEnd->toDateTimeString(),
                    'available' => true,
                ];
            }

            $current = $slotEnd;
        }

        return $slots;
    }
}
