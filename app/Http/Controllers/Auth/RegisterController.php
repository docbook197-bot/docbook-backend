<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Services\SupabaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    protected $supabaseService;

    public function __construct(SupabaseService $supabaseService)
    {
        $this->supabaseService = $supabaseService;
    }

    /**
     * Register a new user (patient or doctor).
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone_number' => ['required', 'string', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:patient,doctor'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // If user is a doctor, require additional information
        if ($validated['role'] === 'doctor') {
            return response()->json([
                'message' => 'User registered. Please complete your doctor profile.',
                'user_id' => $user->id,
                'role' => 'doctor',
            ], 201);
        }

        return response()->json([
            'message' => 'User registered successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Complete doctor profile after registration.
     */
    public function completeDoctorProfile(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'specialization_id' => ['required', 'exists:specializations,id'],
            'hospital_name' => ['required', 'string'],
            'profile_picture' => ['required', 'image', 'max:5120'], // 5MB
            'certificate' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'], // 10MB
            'bio' => ['nullable', 'string', 'max:1000'],
            'consultation_duration' => ['integer', 'min:15', 'max:480'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($user->role !== 'doctor') {
            return response()->json([
                'message' => 'User is not a doctor.',
            ], 403);
        }

        // Upload files to Supabase
        $profileUrl = $this->supabaseService->uploadProfilePicture($request->file('profile_picture'));
        $certificateUrl = $this->supabaseService->uploadCertificate($request->file('certificate'));

        if (!$profileUrl || !$certificateUrl) {
            return response()->json([
                'message' => 'Failed to upload files.',
            ], 500);
        }

        // Create or update doctor profile
        $doctor = Doctor::updateOrCreate(
            ['user_id' => $user->id],
            [
                'specialization_id' => $validated['specialization_id'],
                'hospital_name' => $validated['hospital_name'],
                'profile_picture_url' => $profileUrl,
                'certificate_url' => $certificateUrl,
                'bio' => $validated['bio'] ?? null,
                'consultation_duration' => $validated['consultation_duration'] ?? 30,
                'consultation_fee' => $validated['consultation_fee'] ?? null,
                'is_approved' => true,
            ]
        );

        return response()->json([
            'message' => 'Doctor profile created successfully.',
            'doctor' => $doctor->load('specialization'),
        ], 201);
    }
}
