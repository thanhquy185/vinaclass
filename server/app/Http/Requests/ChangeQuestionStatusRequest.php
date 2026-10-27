<?php

namespace App\Http\Requests;

use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class ChangeQuestionStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();
        $question = $this->route('question');
        $status = $this->input('status');

        return $actor instanceof User
            && $question instanceof Question
            && is_string($status)
            && $actor->can('changeStatus', [$question, $status]);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:public,private,archive'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Vui lòng chọn trạng thái câu hỏi.',
            'status.in' => 'Trạng thái câu hỏi không hợp lệ.',
        ];
    }

    public function attributes(): array
    {
        return [
            'status' => 'Trạng thái câu hỏi',
        ];
    }
}
