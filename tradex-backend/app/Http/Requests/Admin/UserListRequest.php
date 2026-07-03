<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by permission middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search'    => 'nullable|string|max:255',
            'status'    => 'nullable|in:active,inactive,suspended',
            'sort_by'   => 'nullable|in:id,name,email,wallet_balance,created_at',
            'sort_dir'  => 'nullable|in:asc,desc',
            'per_page'  => 'nullable|integer|min:1|max:100',
        ];
    }
}
