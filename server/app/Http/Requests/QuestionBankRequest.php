<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Foundation\Http\FormRequest;

class QuestionBankRequest extends FormRequest
{
    public function authorize(QuestionPolicy $policy): bool
    {
        $actor = $this->user();

        return $actor instanceof User && $policy->accessBank($actor);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:public,private,archive'],
            'search_by' => ['nullable', 'in:content,answer'],
            'keyword' => ['nullable', 'string', 'max:500'],
            'subject_id' => ['nullable', 'integer', 'min:1'],
            'chapter_id' => ['nullable', 'integer', 'min:1'],
            'difficulty_id' => ['nullable', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'in:none,asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
