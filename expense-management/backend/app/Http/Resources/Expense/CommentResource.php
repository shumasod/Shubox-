<?php

declare(strict_types=1);

namespace App\Http\Resources\Expense;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'is_edited' => $this->is_edited,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'replies' => self::collection($this->whenLoaded('replies')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
