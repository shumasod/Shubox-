<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    private const MAX_RESULTS_PER_TYPE = 5;
    private const MIN_QUERY_LENGTH     = 2;

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'q'    => 'required|string|min:' . self::MIN_QUERY_LENGTH . '|max:100',
            'type' => 'nullable|in:expense,user,vendor,project,category',
        ]);

        $q        = $request->input('q');
        $type     = $request->input('type');
        $tenantId = Auth::user()->tenant_id;
        $results  = [];

        if (!$type || $type === 'expense') {
            $results['expenses'] = $this->searchExpenses($q, $tenantId);
        }

        if (!$type || $type === 'user') {
            $results['users'] = $this->searchUsers($q, $tenantId);
        }

        if (!$type || $type === 'vendor') {
            $results['vendors'] = $this->searchVendors($q, $tenantId);
        }

        if (!$type || $type === 'project') {
            $results['projects'] = $this->searchProjects($q, $tenantId);
        }

        if (!$type || $type === 'category') {
            $results['categories'] = $this->searchCategories($q, $tenantId);
        }

        $total = array_sum(array_map('count', $results));

        return response()->json([
            'query'   => $q,
            'total'   => $total,
            'results' => $results,
        ]);
    }

    private function searchExpenses(string $q, int $tenantId): array
    {
        return DB::table('expenses')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->where(fn ($qb) => $qb
                ->where('title', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%")
            )
            ->select('id', 'title', 'amount', 'currency', 'status', 'expense_date')
            ->orderByDesc('expense_date')
            ->limit(self::MAX_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($row) => [
                'type'     => 'expense',
                'id'       => $row->id,
                'label'    => $row->title,
                'sub'      => "¥" . number_format($row->amount) . ' · ' . $row->status,
                'url'      => "/expenses/{$row->id}",
            ])
            ->all();
    }

    private function searchUsers(string $q, int $tenantId): array
    {
        return DB::table('users')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where(fn ($qb) => $qb
                ->where('name', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%")
            )
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->limit(self::MAX_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($row) => [
                'type'  => 'user',
                'id'    => $row->id,
                'label' => $row->name,
                'sub'   => $row->email,
                'url'   => "/admin/users/{$row->id}",
            ])
            ->all();
    }

    private function searchVendors(string $q, int $tenantId): array
    {
        return DB::table('vendors')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->where(fn ($qb) => $qb
                ->where('name', 'like', "%{$q}%")
                ->orWhere('code', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%")
            )
            ->select('id', 'name', 'code', 'status')
            ->orderBy('name')
            ->limit(self::MAX_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($row) => [
                'type'  => 'vendor',
                'id'    => $row->id,
                'label' => $row->name,
                'sub'   => $row->code ?? $row->status,
                'url'   => "/vendors/{$row->id}",
            ])
            ->all();
    }

    private function searchProjects(string $q, int $tenantId): array
    {
        return DB::table('projects')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->where(fn ($qb) => $qb
                ->where('name', 'like', "%{$q}%")
                ->orWhere('code', 'like', "%{$q}%")
            )
            ->select('id', 'name', 'code', 'status')
            ->orderBy('name')
            ->limit(self::MAX_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($row) => [
                'type'  => 'project',
                'id'    => $row->id,
                'label' => $row->name,
                'sub'   => "{$row->code} · {$row->status}",
                'url'   => "/projects/{$row->id}",
            ])
            ->all();
    }

    private function searchCategories(string $q, int $tenantId): array
    {
        return DB::table('expense_categories')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->where(fn ($qb) => $qb
                ->where('name', 'like', "%{$q}%")
                ->orWhere('code', 'like', "%{$q}%")
            )
            ->select('id', 'name', 'code', 'color')
            ->orderBy('sort_order')
            ->limit(self::MAX_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($row) => [
                'type'  => 'category',
                'id'    => $row->id,
                'label' => $row->name,
                'sub'   => $row->code,
                'url'   => "/categories/{$row->id}",
                'color' => $row->color,
            ])
            ->all();
    }
}
