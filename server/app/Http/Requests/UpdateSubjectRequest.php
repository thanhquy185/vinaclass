<?php

namespace App\Http\Requests;

use App\Models\Subject;
use App\Models\User;
use App\Policies\SubjectPolicy;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(SubjectPolicy $policy): bool
    {
        $actor = $this->user();
        $subject = $this->route('subject');

        return $actor instanceof User
            && $subject instanceof Subject
            && !$subject->is_deleted
            && $policy->manage($actor, 'update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'subject_name' => 'sometimes|required|string|max:150',

            'credit_count' => 'sometimes|integer|min:1',

            'theory_hours' => 'required|integer|min:0',
            'practice_hours' => 'required|integer|min:0',

        ];
    }

    public function messages(): array
    {
        return [
            'theory_hours.required' => ':attribute không được để trống',
            'theory_hours.integer' => ':attribute phải là số nguyên',
            'theory_hours.min' => ':attribute không hợp lệ',
            'practice_hours.required' => ':attribute không được để trống',
            'practice_hours.integer' => ':attribute phải là số nguyên',
            'practice_hours.min' => ':attribute không hợp lệ',
        ];
    }

    public function attributes(): array
    {
        return [
            'theory_hours' => 'Số tiết lý thuyết',
            'practice_hours' => 'Số tiết thực hành',
        ];
    }
}
