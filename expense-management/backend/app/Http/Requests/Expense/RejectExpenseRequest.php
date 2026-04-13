<?php

declare(strict_types=1);

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class RejectExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'comment' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'comment.required' => '却下理由は必須です。',
            'comment.min' => '却下理由は10文字以上入力してください。',
        ];
    }
}
