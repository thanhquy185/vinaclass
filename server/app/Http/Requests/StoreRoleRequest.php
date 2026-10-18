<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
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
            'role_name' => ['required', 'string', 'max:255', 'unique:roles,role_name'],
            'role_details' => ['required', 'array', 'min:1'],
            'role_details.*.function_name' => [
                'required',
                'string',
                'exists:functions,function_name',
            ],

            'role_details.*.can_view' => [
                'required',
                'boolean',
            ],

            'role_details.*.can_create' => [
                'required',
                'boolean',
            ],

            'role_details.*.can_update' => [
                'required',
                'boolean',
            ],

            'role_details.*.can_delete' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages()
    {
        return [
            'role_name.required' => ':attribute không được để trống',
            'role_name.string' => ':attribute phải là chuỗi ký tự',
            'role_name.max' => ':attribute không được vượt quá 255 ký tự',
            'role_name.unique' => ':attribute đã tồn tại',

            'role_details.required' => ':attribute không được để trống',
            'role_details.array' => ':attribute phải là mảng',
            'role_details.min' => ':attribute phải có ít nhất 1 phần tử',

            'role_details.*.function_name.required' => ':attribute không được để trống',
            'role_details.*.function_name.string' => ':attribute phải là chuỗi ký tự',
            'role_details.*.function_name.exists' => ':attribute không tồn tại trong hệ thống',

            'role_details.*.can_view.required' => ':attribute không được để trống',
            'role_details.*.can_view.boolean' => ':attribute phải là kiểu đúng/sai',
            'role_details.*.can_create.required' => ':attribute không được để trống',
            'role_details.*.can_create.boolean' => ':attribute phải là kiểu đúng/sai',
            'role_details.*.can_update.required' => ':attribute không được để trống',
            'role_details.*.can_update.boolean' => ':attribute phải là kiểu đúng/sai',
            'role_details.*.can_delete.required' => ':attribute không được để trống',
            'role_details.*.can_delete.boolean' => ':attribute phải là kiểu đúng/sai',
        ];
    }

    public function attributes()
    {
        return [
            'role_name' => 'Tên nhóm quyền',
            'role_details' => 'Danh sách chi tiết quyền',
            'role_details.*.function_name' => 'Tên chức năng',
            'role_details.*.can_view' => 'Quyền xem',
            'role_details.*.can_create' => 'Quyền tạo',
            'role_details.*.can_update' => 'Quyền cập nhật',
            'role_details.*.can_delete' => 'Quyền xóa',
        ];
    }
}
