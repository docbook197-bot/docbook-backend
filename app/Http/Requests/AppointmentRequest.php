<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AppointmentRequest extends FormRequest
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
            'doctor_id' => ['required', 'exists:doctors,id'],
            'appointment_start' => ['required', 'date_format:Y-m-d H:i', 'after:now'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_start.after' => 'The appointment must be scheduled for a future date and time.',
            'appointment_start.date_format' => 'The appointment start must be in the format YYYY-MM-DD HH:MM.',
        ];
    }
}
