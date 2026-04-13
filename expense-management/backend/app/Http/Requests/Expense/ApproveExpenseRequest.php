<?php

declare(strict_types=1);

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class ApproveExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
