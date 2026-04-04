<?php

declare(strict_types=1);

namespace App\Http\Resources\Expense;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovalRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'action_label' => match ($this->action) {
                'approved' => '承認',
                'rejected' => '却下',
                'delegated' => '代理承認',
                default => $this->action,
            },
            'comment' => $this->comment,
            'approver' => $this->whenLoaded('approver', fn() => [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
                'department' => $this->approver->department,
            ]),
            'acted_at' => $this->acted_at->toIso8601String(),
        ];
    }
}
