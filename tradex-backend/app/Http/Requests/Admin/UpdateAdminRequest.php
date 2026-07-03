<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $adminId = $this->route('id') ?: $this->route('admin');

        return [
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|email|max:255|unique:admins,email,' . $adminId,
            'password' => 'nullable|string|min:8',
            'status'   => 'nullable|in:active,inactive,suspended',
            'roles'    => 'nullable|array',
            'roles.*'  => 'exists:roles,id',
        ];
    }
}
