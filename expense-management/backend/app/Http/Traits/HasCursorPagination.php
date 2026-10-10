<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasCursorPagination
{
    /**
     * Apply cursor pagination to a query and return a JSON-ready array.
     *
     * The cursor is a base64-encoded composite key: "<sort_field>:<id>".
     * This avoids the performance cliff of OFFSET on large tables.
     *
     * @param Builder $query       Already-scoped query (tenant, filters applied)
     * @param Request $request     For reading `cursor` and `limit` params
     * @param string  $sortField   Column to sort by (default: created_at)
     * @param string  $sortDir     asc|desc (default: desc)
     * @param int     $maxLimit    Hard cap on page size
     */
    protected function cursorPaginate(
        Builder $query,
        Request $request,
        string $sortField = 'created_at',
        string $sortDir   = 'desc',
        int    $maxLimit  = 100,
    ): array {
        $limit  = min((int) ($request->query('limit', 20)), $maxLimit);
        $cursor = $request->query('cursor');

        if ($cursor) {
            [$cursorValue, $cursorId] = $this->decodeCursor($cursor);

            $op = $sortDir === 'desc' ? '<' : '>';

            $query->where(fn($q) =>
                $q->where($sortField, $op, $cursorValue)
                  ->orWhere(fn($q2) =>
                      $q2->where($sortField, $cursorValue)
                         ->where('id', $op, $cursorId)
                  )
            );
        }

        $query->orderBy($sortField, $sortDir)->orderBy('id', $sortDir);

        $items = $query->limit($limit + 1)->get();

        $hasMore     = $items->count() > $limit;
        $data        = $hasMore ? $items->slice(0, $limit) : $items;
        $nextCursor  = null;

        if ($hasMore) {
            $last       = $data->last();
            $nextCursor = $this->encodeCursor((string) $last->{$sortField}, (string) $last->id);
        }

        return [
            'data'        => $data->values(),
            'meta' => [
                'has_more'    => $hasMore,
                'next_cursor' => $nextCursor,
                'limit'       => $limit,
            ],
        ];
    }

    private function encodeCursor(string $value, string $id): string
    {
        return base64_encode("{$value}:{$id}");
    }

    private function decodeCursor(string $cursor): array
    {
        $decoded = base64_decode($cursor, strict: true);

        if ($decoded === false || !str_contains($decoded, ':')) {
            abort(422, 'Invalid pagination cursor.');
        }

        $lastColon = strrpos($decoded, ':');
        return [
            substr($decoded, 0, $lastColon),
            substr($decoded, $lastColon + 1),
        ];
    }
}
