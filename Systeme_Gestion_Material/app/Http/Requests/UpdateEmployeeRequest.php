<?php

namespace App\Http\Requests;

use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    // app/Http/Requests/UpdateEmployeeRequest.php
    public function rules()
    {
        $employeeId = $this->route('employee'); // Gets the ID from URL
        
        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore(Employee::find($employeeId)->user_id)
            ],
            'matricule' => [
                'sometimes',
                'string',
                Rule::unique('employees', 'matricule')->ignore($employeeId)
            ],
            'role' => 'sometimes|string|exists:roles,name'
        ];
    }
}
