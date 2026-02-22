<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteDoctorProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'specialization' => ['required', 'string', 'max:255'],
            'hospital_name' => ['required', 'string', 'max:255'],
            'profile_picture' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
            'certificate' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'consultation_duration' => ['integer', 'min:15', 'max:480'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'profile_picture.max' => 'The profile picture must not exceed 5MB.',
            'certificate.max' => 'The certificate must not exceed 10MB.',
            'consultation_duration.min' => 'The consultation duration must be at least 15 minutes.',
            'consultation_duration.max' => 'The consultation duration cannot exceed 480 minutes.',
        ];
    }
}
