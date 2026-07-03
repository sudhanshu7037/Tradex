<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AuditLogListRequest extends FormRequest
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
        return [
            'admin_id'    => 'nullable|integer|exists:admins,id',
            'action'      => 'nullable|string|max:255',
            'entity_type' => 'nullable|string|max:255',
            'from_date'   => 'nullable|date',
            'to_date'     => 'nullable|date|after_or_equal:from_date',
            'sort_by'     => 'nullable|in:id,admin_id,action,entity_type,created_at',
            'sort_dir'    => 'nullable|in:asc,desc',
            'per_page'    => 'nullable|integer|min:1|max:100',
        ];
    }
}
