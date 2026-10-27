<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\TeacherSubjectPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherAssignmentOverviewRequest extends FormRequest
{
    public function authorize(TeacherSubjectPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->viewOverview($actor);
    }

    public function rules(): array
    {
        return [
            'search_by' => ['sometimes', 'string', Rule::in(['teacher', 'subject'])],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
