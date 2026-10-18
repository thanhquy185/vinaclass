<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeQuestionStatusRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status' => ['required', 'in:public,private,archive'],
        ];
    }

    public function messages()
    {
        return [
            'status.required' => 'Vui lòng chọn trạng thái câu hỏi.',
            'status.in' => 'Trạng thái câu hỏi không hợp lệ.',
        ];
    }

    public function attributes()
    {
        return [
            'status' => 'Trạng thái câu hỏi',
        ];
    }
}
