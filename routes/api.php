<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes - Authentication
Route::post('/auth/register', [RegisterController::class, 'register']);
Route::post('/auth/login', [LoginController::class, 'login']);
Route::post('/auth/complete-doctor-profile', [RegisterController::class, 'completeDoctorProfile']);

// Public routes - Doctor Search
Route::get('/doctors/search', [DoctorController::class, 'search']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);
Route::get('/doctors/{id}/available-slots', [DoctorController::class, 'getAvailableSlots']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/me', [LoginController::class, 'me']);
    Route::post('/logout', [LoginController::class, 'logout']);

    // Doctor routes
    Route::get('/doctor/appointments', [AppointmentController::class, 'doctorAppointments']);
    Route::post('/doctor/availability', [DoctorController::class, 'updateAvailability']);

    // Doctor appointment management
    Route::post('/appointments/{id}/approve', [AppointmentController::class, 'approve']);
    Route::post('/appointments/{id}/reject', [AppointmentController::class, 'reject']);
    Route::post('/appointments/{id}/complete', [AppointmentController::class, 'complete']);

    // Patient appointment routes
    Route::post('/appointments', [AppointmentController::class, 'create']);
    Route::get('/appointments/my', [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::post('/appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
});

// Admin routes (optional - add role middleware as needed)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/doctors', [DoctorController::class, 'index']);
});
