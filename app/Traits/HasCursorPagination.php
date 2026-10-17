<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasCursorPagination
{
    protected function paginateWithCursor(
        Builder $query,
        Request $request,
        int $perPage = 20,
        string $orderColumn = 'id',
        string $orderDirection = 'desc'
    ): array {
        $cursor  = $request->query('cursor');
        $limit   = min((int) ($request->query('limit', $perPage)), 100);

        if ($cursor) {
            $decoded = json_decode(base64_decode($cursor), true);
            if (is_array($decoded) && isset($decoded['id'], $decoded['val'])) {
                $op = $orderDirection === 'desc' ? '<' : '>';
                $query->where(function (Builder $q) use ($decoded, $op, $orderColumn) {
                    $q->where($orderColumn, $op, $decoded['val'])
                      ->orWhere(function (Builder $q2) use ($decoded, $op, $orderColumn) {
                          $q2->where($orderColumn, '=', $decoded['val'])
                             ->where('id', $op, $decoded['id']);
                      });
                });
            }
        }

        $items = $query
            ->orderBy($orderColumn, $orderDirection)
            ->orderBy('id', $orderDirection)
            ->limit($limit + 1)
            ->get();

        $hasMore  = $items->count() > $limit;
        $data     = $hasMore ? $items->take($limit) : $items;
        $nextCursor = null;

        if ($hasMore) {
            $last = $data->last();
            $nextCursor = base64_encode(json_encode([
                'id'  => $last->id,
                'val' => $last->{$orderColumn},
            ]));
        }

        return [
            'data'        => $data->values(),
            'next_cursor' => $nextCursor,
            'has_more'    => $hasMore,
            'limit'       => $limit,
        ];
    }
}
