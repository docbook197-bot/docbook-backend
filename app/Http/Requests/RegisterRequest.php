<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone_number' => ['required', 'string', 'regex:/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im', 'unique:users'],
            'password' => ['required', 'confirmed', Password::default()],
            'role' => ['required', 'in:patient,doctor'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone_number.regex' => 'The phone number format is invalid.',
            'role.in' => 'The role must be either patient or doctor.',
        ];
    }
}
