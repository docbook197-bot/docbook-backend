<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Create a new appointment.
     */
    public function create(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json([
                'message' => 'Only patients can book appointments.',
            ], 403);
        }

        $validated = $request->validate([
            'doctor_id' => ['required', 'exists:doctors,id'],
            'appointment_start' => ['required', 'date_format:Y-m-d H:i', 'after:now'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = Doctor::findOrFail($validated['doctor_id']);

        // Check if doctor is approved
        if (!$doctor->is_approved) {
            return response()->json([
                'message' => 'Doctor is not approved yet.',
            ], 403);
        }

        $appointmentStart = Carbon::parse($validated['appointment_start']);
        $appointmentEnd = $appointmentStart->copy()->addMinutes($doctor->consultation_duration);

        // Check if doctor already has an appointment at this time
        if ($doctor->hasAppointmentAt($appointmentStart)) {
            return response()->json([
                'message' => 'Doctor is not available at this time.',
                'available_slots' => $doctor->getAvailableSlots($appointmentStart),
            ], 409);
        }

        $appointment = Appointment::create([
            'patient_id' => $user->id,
            'doctor_id' => $doctor->id,
            'appointment_start' => $appointmentStart,
            'appointment_end' => $appointmentEnd,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Appointment created successfully.',
            'appointment' => $appointment->load('patient', 'doctor'),
        ], 201);
    }

    /**
     * Get patient's appointments.
     */
    public function myAppointments(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json([
                'message' => 'Only patients can view their appointments.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['nullable', 'in:scheduled,approved,rejected,completed,cancelled'],
            'page' => ['integer', 'min:1'],
        ]);

        $appointments = $user->patientAppointments()
            ->with('doctor.user')
            ->when($request->filled('status'), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->orderBy('appointment_start', 'desc')
            ->paginate(10);

        return response()->json([
            'appointments' => $appointments,
        ], 200);
    }

    /**
     * Get doctor's appointments.
     */
    public function doctorAppointments(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'doctor' || !$user->doctor) {
            return response()->json([
                'message' => 'Only doctors can view their appointments.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['nullable', 'in:scheduled,approved,rejected,completed,cancelled'],
            'page' => ['integer', 'min:1'],
        ]);

        $appointments = Appointment::where('doctor_id', $user->doctor->id)
            ->with('patient')
            ->when($request->filled('status'), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->orderBy('appointment_start', 'desc')
            ->paginate(10);

        return response()->json([
            'appointments' => $appointments,
        ], 200);
    }

    /**
     * Get appointment details.
     */
    public function show($id, Request $request)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Check authorization
        if ($user->id !== $appointment->patient_id && 
            ($user->role !== 'doctor' || $user->id !== $appointment->doctor->user_id)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'appointment' => $appointment->load('patient', 'doctor.user'),
        ], 200);
    }

    /**
     * Approve appointment (doctor only).
     */
    public function approve($id, Request $request)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'doctor' || $user->id !== $appointment->doctor->user_id) {
            return response()->json([
                'message' => 'Only the assigned doctor can approve this appointment.',
            ], 403);
        }

        $appointment->approve();

        return response()->json([
            'message' => 'Appointment approved.',
            'appointment' => $appointment,
        ], 200);
    }

    /**
     * Reject appointment (doctor or patient).
     */
    public function reject($id, Request $request)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Check authorization
        if ($user->id !== $appointment->patient_id && 
            ($user->role !== 'doctor' || $user->id !== $appointment->doctor->user_id)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $appointment->reject($validated['reason'] ?? null);

        return response()->json([
            'message' => 'Appointment rejected.',
            'appointment' => $appointment,
        ], 200);
    }

    /**
     * Reschedule appointment.
     */
    public function reschedule($id, Request $request)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Check authorization
        if ($user->id !== $appointment->patient_id && 
            ($user->role !== 'doctor' || $user->id !== $appointment->doctor->user_id)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'appointment_start' => ['required', 'date_format:Y-m-d H:i', 'after:now'],
        ]);

        $newDateTime = Carbon::parse($validated['appointment_start']);

        if (!$appointment->reschedule($newDateTime, $user->id)) {
            return response()->json([
                'message' => 'Doctor is not available at this time.',
                'available_slots' => $appointment->doctor->getAvailableSlots($newDateTime),
            ], 409);
        }

        return response()->json([
            'message' => 'Appointment rescheduled successfully.',
            'appointment' => $appointment,
        ], 200);
    }

    /**
     * Complete appointment (doctor only).
     */
    public function complete($id, Request $request)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'doctor' || $user->id !== $appointment->doctor->user_id) {
            return response()->json([
                'message' => 'Only the assigned doctor can complete this appointment.',
            ], 403);
        }

        // Check if appointment time has passed
        if (!$appointment->isPast()) {
            return response()->json([
                'message' => 'Cannot complete an appointment that hasn\'t ended yet.',
            ], 400);
        }

        $validated = $request->validate([
            'doctor_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $appointment->complete($validated['doctor_notes'] ?? null);

        return response()->json([
            'message' => 'Appointment completed.',
            'appointment' => $appointment,
        ], 200);
    }

    /**
     * Cancel appointment (patient or doctor).
     */
    public function cancel($id, Request $request)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Check authorization
        if ($user->id !== $appointment->patient_id && 
            ($user->role !== 'doctor' || $user->id !== $appointment->doctor->user_id)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        // Check if appointment is in the past
        if ($appointment->isPast()) {
            return response()->json([
                'message' => 'Cannot cancel a past appointment.',
            ], 400);
        }

        $appointment->cancel();

        return response()->json([
            'message' => 'Appointment cancelled.',
            'appointment' => $appointment,
        ], 200);
    }
}
