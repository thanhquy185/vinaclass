<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubjectRequest extends FormRequest
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
    public function rules()
    {
        return [
            'subject_name' => 'sometimes|string|max:150',

            'credit_count' => 'sometimes|integer|min:1',

            'theory_hours' => 'sometimes|integer|min:0',
            'practice_hours' => 'sometimes|integer|min:0',

            'is_deleted' => 'sometimes|boolean',
        ];
    }
}
