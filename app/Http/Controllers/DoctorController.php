<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Specialization;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Get all specializations.
     */
    public function getSpecializations()
    {
        $specializations = Specialization::all();

        return response()->json([
            'specializations' => $specializations,
        ], 200);
    }

    /**
     * Get doctor profile.
     */
    public function show($id)
    {
        $doctor = Doctor::with(['user', 'specialization', 'availability'])->findOrFail($id);

        return response()->json([
            'doctor' => [
                'id' => $doctor->id,
                'user' => $doctor->user,
                'specialization' => $doctor->specialization ? $doctor->specialization->name : null,
                'hospital_name' => $doctor->hospital_name,
                'bio' => $doctor->bio,
                'profile_picture_url' => $doctor->profile_picture_url,
                'certificate_url' => $doctor->certificate_url,
                'consultation_duration' => $doctor->consultation_duration,
                'consultation_fee' => $doctor->consultation_fee,
                'is_approved' => $doctor->is_approved,
                'availability' => $doctor->availability,
                'created_at' => $doctor->created_at,
                'updated_at' => $doctor->updated_at,
            ],
        ], 200);
    }

    /**
     * Search doctors by specialization, hospital, or name.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string'],
            'specialization_id' => ['nullable', 'exists:specializations,id'],
            'hospital' => ['nullable', 'string'],
            'page' => ['integer', 'min:1'],
        ]);

        $query = Doctor::where('is_approved', true)
            ->with(['user', 'specialization', 'availability']);

        if ($request->filled('name')) {
            $query->whereHas('user', function ($q) use ($validated) {
                $q->where('name', 'like', '%' . $validated['name'] . '%');
            });
        }

        if ($request->filled('specialization_id')) {
            $query->where('specialization_id', $validated['specialization_id']);
        }

        if ($request->filled('hospital')) {
            $query->where('hospital_name', 'like', '%' . $validated['hospital'] . '%');
        }

        $doctors = $query->paginate(15);

        $doctorsTransformed = $doctors->getCollection()->map(function ($doctor) {
            return [
                'id' => $doctor->id,
                'user' => $doctor->user,
                'specialization' => $doctor->specialization ? $doctor->specialization->name : null,
                'hospital_name' => $doctor->hospital_name,
                'bio' => $doctor->bio,
                'profile_picture_url' => $doctor->profile_picture_url,
                'certificate_url' => $doctor->certificate_url,
                'consultation_duration' => $doctor->consultation_duration,
                'consultation_fee' => $doctor->consultation_fee,
                'is_approved' => $doctor->is_approved,
                'availability' => $doctor->availability,
                'created_at' => $doctor->created_at,
                'updated_at' => $doctor->updated_at,
            ];
        });
        $doctorsPaginated = $doctors->toArray();
        $doctorsPaginated['data'] = $doctorsTransformed;

        return response()->json([
            'doctors' => $doctorsPaginated,
        ], 200);
    }

    /**
     * Get all doctors.
     */
    public function index(Request $request)
    {
        $doctors = Doctor::with(['user', 'specialization'])
            ->paginate(15);

        $doctorsTransformed = $doctors->getCollection()->map(function ($doctor) {
            return [
                'id' => $doctor->id,
                'user' => $doctor->user,
                'specialization' => $doctor->specialization ? $doctor->specialization->name : null,
                'hospital_name' => $doctor->hospital_name,
                'bio' => $doctor->bio,
                'profile_picture_url' => $doctor->profile_picture_url,
                'certificate_url' => $doctor->certificate_url,
                'consultation_duration' => $doctor->consultation_duration,
                'consultation_fee' => $doctor->consultation_fee,
                'is_approved' => $doctor->is_approved,
                'created_at' => $doctor->created_at,
                'updated_at' => $doctor->updated_at,
            ];
        });
        $doctorsPaginated = $doctors->toArray();
        $doctorsPaginated['data'] = $doctorsTransformed;

        return response()->json([
            'doctors' => $doctorsPaginated,
        ], 200);
    }

    /**
     * Update doctor availability.
     */
    public function updateAvailability(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'doctor' || !$user->doctor) {
            return response()->json([
                'message' => 'Only doctors can update availability.',
            ], 403);
        }

        $validated = $request->validate([
            'availability' => ['required', 'array'],
            'availability.*.day_of_week' => ['required', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'availability.*.start_time' => ['required', 'date_format:H:i'],
            'availability.*.end_time' => ['required', 'date_format:H:i'],
            'availability.*.is_available' => ['boolean'],
        ]);

        $doctor = $user->doctor;
        $doctor->availability()->delete();

        foreach ($validated['availability'] as $slot) {
            $doctor->availability()->create($slot);
        }

        return response()->json([
            'message' => 'Availability updated successfully.',
            'availability' => $doctor->availability,
        ], 200);
    }

    /**
     * Get doctor's available time slots for a specific date.
     */
    public function getAvailableSlots($doctorId, Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after:today'],
        ]);

        $doctor = Doctor::findOrFail($doctorId);
        
        // Check if doctor is approved
        if (!$doctor->is_approved) {
            return response()->json([
                'message' => 'Doctor is not available.',
            ], 403);
        }
        
        $date = \Carbon\Carbon::parse($validated['date']);
        $slots = $doctor->getAvailableSlots($date);

        return response()->json([
            'doctor_id' => $doctorId,
            'date' => $validated['date'],
            'slots' => $slots,
        ], 200);
    }
}
