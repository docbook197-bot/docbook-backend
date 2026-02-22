<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Prepare user response based on role
        $userResponse = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ];

        // Only include doctor data if user is a doctor
        if ($user->role === 'doctor' && $user->doctor) {
            $userResponse['doctor'] = $user->doctor->load('specialization');
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $userResponse,
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ], 200);
    }

    /**
     * Get current user.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Prepare user response based on role
        $userResponse = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ];

        // Only include doctor data if user is a doctor
        if ($user->role === 'doctor' && $user->doctor) {
            $userResponse['doctor'] = $user->doctor->load('specialization');
        }

        return response()->json([
            'user' => $userResponse,
        ], 200);
    }
}
