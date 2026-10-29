<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ExpenseCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private readonly ExpenseCacheService $cache,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId   = $request->attributes->get('tenant_id');
        $categories = $this->cache->getCategories($tenantId);

        return response()->json(['data' => $categories]);
    }
}
