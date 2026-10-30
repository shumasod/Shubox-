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
            'id'         => $this->id,
            'body'       => $this->body,
            'parent_id'  => $this->parent_id,
            'author'     => [
                'id'         => $this->author->id,
                'name'       => $this->author->name,
                'department' => $this->author->department,
            ],
            'replies'    => CommentResource::collection($this->whenLoaded('replies')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
