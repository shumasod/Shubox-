<?php

declare(strict_types=1);

namespace App\Http\Resources\Expense;

use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExpenseModel */
class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expense_number' => $this->expense_number,
            'title' => $this->title,
            'description' => $this->description,
            'total_amount' => $this->total_amount,
            'total_amount_formatted' => '¥' . number_format($this->total_amount),
            'currency' => $this->currency,
            'status' => $this->status,
            'status_label' => $this->statusLabel(),
            'current_step' => $this->current_step,
            'applied_at' => $this->applied_at?->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'due_date' => $this->due_date?->toDateString(),
            'applicant' => $this->whenLoaded('applicant', fn() => [
                'id' => $this->applicant->id,
                'name' => $this->applicant->name,
                'email' => $this->applicant->email,
                'department' => $this->applicant->department,
            ]),
            'items' => ExpenseItemResource::collection($this->whenLoaded('items')),
            'approval_records' => ApprovalRecordResource::collection($this->whenLoaded('approvalRecords')),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
            'can_edit' => in_array($this->status, ['draft', 'rejected'], true),
            'can_submit' => $this->status === 'draft',
            'can_cancel' => in_array($this->status, ['draft', 'pending', 'partially_approved'], true),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }

    private function statusLabel(): string
    {
        return match ($this->status) {
            'draft' => '下書き',
            'pending' => '申請中',
            'partially_approved' => '一部承認',
            'approved' => '承認済み',
            'rejected' => '却下',
            'cancelled' => '取り消し',
            'paid' => '支払済み',
            default => $this->status,
        };
    }
}
