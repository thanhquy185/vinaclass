<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user');

        return [
            "full_name" => ["sometimes", "string", "max:255"],

            "email" => [
                "sometimes",
                "string",
                "email",
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],

            "role_id" => ["sometimes", "numeric", "exists:roles,id", "nullable"],
            "phone" => ["sometimes", "string", "max:20"],

            "date_of_birth" => ["sometimes", "date_format:Y-m-d", "before:today"],

            "is_female" => ["sometimes", "boolean"],
            "is_student" => ["required", "boolean"],
            "is_locked" => ["required", "boolean"],

            "ggid" => ["sometimes", "string"],

            "avatar_url" => ["sometimes", "string"]
        ];
    }
}
