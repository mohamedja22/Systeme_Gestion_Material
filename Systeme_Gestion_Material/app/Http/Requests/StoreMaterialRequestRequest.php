<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequestRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'material_name' => 'required|string|max:255',
            'quantity' => 'sometimes|integer|min:1',
            'justification' => 'required|string',
        ];
    }


    public function messages()
    {
        return [
            'material_name.required' => 'Material name is required.',
            'material_name.string' => 'Material name must be a string.',
            'material_name.max' => 'Material name may not be greater than 255 characters.',
            'quantity.integer' => 'Quantity must be an integer.',
            'quantity.min' => 'Quantity must be at least 1.',
            'justification.required' => 'Justification is required.',
            'justification.string' => 'Justification must be a string.',
        ];
    }
}