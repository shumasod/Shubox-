<?php

declare(strict_types=1);

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class CreateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'currency' => ['nullable', 'string', 'in:JPY,USD,EUR'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.category_id' => ['required', 'uuid', 'exists:categories,id'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.amount' => ['required', 'integer', 'min:1', 'max:99999999'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'items.*.expense_date' => ['required', 'date', 'before_or_equal:today'],
            'items.*.vendor' => ['nullable', 'string', 'max:200'],
            'items.*.purpose' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '件名は必須です。',
            'items.required' => '明細は最低1件必要です。',
            'items.*.category_id.exists' => '選択されたカテゴリが存在しません。',
            'items.*.amount.min' => '金額は1円以上で入力してください。',
            'items.*.expense_date.before_or_equal' => '利用日は今日以前の日付を入力してください。',
        ];
    }
}
