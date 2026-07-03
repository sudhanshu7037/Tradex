<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TransactionListRequest extends FormRequest
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
            'search'           => 'nullable|string|max:255',
            'user_id'          => 'nullable|integer|exists:users,id',
            'symbol'           => 'nullable|string|max:20',
            'transaction_type' => 'nullable|in:BUY,SELL',
            'from_date'        => 'nullable|date',
            'to_date'          => 'nullable|date|after_or_equal:from_date',
            'sort_by'          => 'nullable|in:id,user_id,stock_symbol,transaction_type,quantity,price_per_share,total_value,executed_at,created_at',
            'sort_dir'         => 'nullable|in:asc,desc',
            'per_page'         => 'nullable|integer|min:1|max:100',
        ];
    }
}
