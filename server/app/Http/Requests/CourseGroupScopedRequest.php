<?php

namespace App\Http\Requests;

use App\Models\CourseGroup;
use Illuminate\Foundation\Http\FormRequest;

abstract class CourseGroupScopedRequest extends FormRequest
{
    final public function authorize(): bool
    {
        $courseGroup = $this->route('courseGroup');

        return $courseGroup instanceof CourseGroup
            && ($this->user()?->can('update', $courseGroup) ?? false);
    }
}
