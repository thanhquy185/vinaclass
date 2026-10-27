<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserLockRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();
        $target = $this->route('user');

        return $actor instanceof User
            && $target instanceof User
            && $actor->can('update', [
                $target,
                ['is_locked' => $this->input('is_locked')],
            ]);
    }

    public function rules(): array
    {
        return [
            'is_locked' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_locked.required' => 'Vui lòng chọn trạng thái khóa.',
            'is_locked.boolean' => 'Trạng thái khóa không hợp lệ.',
        ];
    }
}
