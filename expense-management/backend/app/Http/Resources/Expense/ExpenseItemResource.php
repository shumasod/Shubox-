<?php

declare(strict_types=1);

namespace App\Http\Resources\Expense;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'code' => $this->category->code,
            ]),
            'description' => $this->description,
            'amount' => $this->amount,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => $this->amount * $this->quantity,
            'line_total_formatted' => '¥' . number_format($this->amount * $this->quantity),
            'expense_date' => $this->expense_date->toDateString(),
            'vendor' => $this->vendor,
            'purpose' => $this->purpose,
            'sort_order' => $this->sort_order,
            'receipts' => ReceiptResource::collection($this->whenLoaded('receipts')),
        ];
    }
}
