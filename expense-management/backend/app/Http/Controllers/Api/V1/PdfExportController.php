<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateExpensePdf;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PdfExportController extends Controller
{
    public function expense(int $id): JsonResponse
    {
        $expense = Expense::where('tenant_id', Auth::user()->tenant_id)->findOrFail($id);

        GenerateExpensePdf::dispatch($expense->id, Auth::id());

        return response()->json([
            'message' => 'PDFの生成を開始しました。完了次第通知します。',
        ], 202);
    }
}
