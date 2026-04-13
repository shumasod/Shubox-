<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Application\DTOs\CreateExpenseDTO;
use App\Application\DTOs\ExpenseItemDTO;
use App\Application\DTOs\ExpenseSearchDTO;
use App\Application\UseCases\Expense\ApproveExpenseUseCase;
use App\Application\UseCases\Expense\CreateExpenseUseCase;
use App\Application\UseCases\Expense\ExportExpensesUseCase;
use App\Application\UseCases\Expense\RejectExpenseUseCase;
use App\Application\UseCases\Expense\SearchExpensesUseCase;
use App\Application\UseCases\Expense\SubmitExpenseUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\ApproveExpenseRequest;
use App\Http\Requests\Expense\CreateExpenseRequest;
use App\Http\Requests\Expense\RejectExpenseRequest;
use App\Http\Resources\Expense\ExpenseResource;
use App\Infrastructure\Persistence\Eloquent\Models\ExpenseModel;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseController extends Controller
{
    public function __construct(
        private readonly CreateExpenseUseCase $createUseCase,
        private readonly SubmitExpenseUseCase $submitUseCase,
        private readonly ApproveExpenseUseCase $approveUseCase,
        private readonly RejectExpenseUseCase $rejectUseCase,
        private readonly SearchExpensesUseCase $searchUseCase,
        private readonly ExportExpensesUseCase $exportUseCase,
    ) {}

    /**
     * 経費一覧取得
     *
     * @OA\Get(
     *   path="/api/v1/expenses",
     *   tags={"Expenses"},
     *   summary="経費一覧",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="status", in="query", schema={"type":"string"}),
     *   @OA\Parameter(name="date_from", in="query", schema={"type":"string","format":"date"}),
     *   @OA\Parameter(name="date_to", in="query", schema={"type":"string","format":"date"}),
     *   @OA\Parameter(name="keyword", in="query", schema={"type":"string"}),
     *   @OA\Parameter(name="per_page", in="query", schema={"type":"integer","default":20}),
     *   @OA\Parameter(name="page", in="query", schema={"type":"integer","default":1}),
     *   @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $dto = new ExpenseSearchDTO(
            tenantId: $user->tenant_id,
            status: $request->query('status'),
            applicantId: $request->query('applicant_id'),
            categoryId: $request->query('category_id'),
            dateFrom: $request->query('date_from'),
            dateTo: $request->query('date_to'),
            amountMin: $request->query('amount_min') ? (int) $request->query('amount_min') : null,
            amountMax: $request->query('amount_max') ? (int) $request->query('amount_max') : null,
            keyword: $request->query('keyword'),
            perPage: min((int) ($request->query('per_page', 20)), 100),
            page: (int) ($request->query('page', 1)),
            sortBy: $request->query('sort_by', 'created_at'),
            sortDir: $request->query('sort_dir', 'desc'),
        );

        $result = $this->searchUseCase->execute($dto);

        return response()->json([
            'data' => ExpenseResource::collection(collect($result['data'])),
            'meta' => [
                'total' => $result['total'],
                'per_page' => $result['per_page'],
                'current_page' => $result['current_page'],
                'last_page' => $result['last_page'],
            ],
        ]);
    }

    /**
     * 経費申請作成
     *
     * @OA\Post(
     *   path="/api/v1/expenses",
     *   tags={"Expenses"},
     *   summary="経費申請作成",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(ref="#/components/schemas/CreateExpenseRequest")),
     *   @OA\Response(response=201, description="Created")
     * )
     */
    public function store(CreateExpenseRequest $request): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validated();

        $itemDtos = array_map(
            fn(array $item) => new ExpenseItemDTO(
                categoryId: $item['category_id'],
                description: $item['description'],
                amount: $item['amount'],
                expenseDate: $item['expense_date'],
                quantity: $item['quantity'] ?? 1,
                vendor: $item['vendor'] ?? null,
                purpose: $item['purpose'] ?? null,
                sortOrder: $item['sort_order'] ?? 0,
            ),
            $validated['items']
        );

        $dto = new CreateExpenseDTO(
            tenantId: $user->tenant_id,
            applicantId: $user->id,
            title: $validated['title'],
            description: $validated['description'] ?? null,
            currency: $validated['currency'] ?? 'JPY',
            items: $itemDtos,
        );

        $expense = $this->createUseCase->execute($dto);

        // Eloquentモデルを再取得してResourceに渡す
        $model = ExpenseModel::with(['applicant', 'items.category', 'items.receipts'])
            ->find($expense->getId());

        return response()->json(
            new ExpenseResource($model),
            Response::HTTP_CREATED
        );
    }

    /**
     * 経費詳細取得
     */
    public function show(string $id): JsonResponse
    {
        $user = auth()->user();
        $expense = ExpenseModel::with([
            'applicant',
            'items.category',
            'items.receipts',
            'approvalRecords.approver',
            'comments.user',
            'comments.replies.user',
        ])
            ->where('tenant_id', $user->tenant_id)
            ->findOrFail($id);

        return response()->json(new ExpenseResource($expense));
    }

    /**
     * 経費更新（下書き・却下のみ）
     */
    public function update(CreateExpenseRequest $request, string $id): JsonResponse
    {
        $user = auth()->user();
        $expense = ExpenseModel::where('tenant_id', $user->tenant_id)->findOrFail($id);

        if (!in_array($expense->status, ['draft', 'rejected'], true)) {
            return response()->json(['message' => '下書きまたは却下の申請のみ編集できます。'], 422);
        }

        if ($expense->applicant_id !== $user->id) {
            return response()->json(['message' => '自身の申請のみ編集できます。'], 403);
        }

        $validated = $request->validated();
        $expense->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        // 既存明細を削除して再作成
        $expense->items()->delete();
        foreach ($validated['items'] as $index => $item) {
            $expense->items()->create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'category_id' => $item['category_id'],
                'description' => $item['description'],
                'amount' => $item['amount'],
                'unit_price' => $item['amount'],
                'quantity' => $item['quantity'] ?? 1,
                'expense_date' => $item['expense_date'],
                'vendor' => $item['vendor'] ?? null,
                'purpose' => $item['purpose'] ?? null,
                'sort_order' => $item['sort_order'] ?? $index,
            ]);
        }

        $total = $expense->items()->sum(\DB::raw('amount * quantity'));
        $expense->update(['total_amount' => $total]);

        return response()->json(
            new ExpenseResource($expense->fresh(['applicant', 'items.category', 'items.receipts']))
        );
    }

    /**
     * 経費削除（下書きのみ）
     */
    public function destroy(string $id): JsonResponse
    {
        $user = auth()->user();
        $expense = ExpenseModel::where('tenant_id', $user->tenant_id)->findOrFail($id);

        if ($expense->status !== 'draft') {
            return response()->json(['message' => '下書きのみ削除できます。'], 422);
        }
        if ($expense->applicant_id !== $user->id) {
            return response()->json(['message' => '自身の申請のみ削除できます。'], 403);
        }

        $expense->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * 申請提出
     */
    public function submit(string $id): JsonResponse
    {
        $user = auth()->user();

        try {
            $expense = $this->submitUseCase->execute($id, $user->tenant_id, $user->id);
            $model = ExpenseModel::with(['applicant', 'items'])->find($expense->getId());
            return response()->json(new ExpenseResource($model));
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * 承認
     */
    public function approve(ApproveExpenseRequest $request, string $id): JsonResponse
    {
        $user = auth()->user();

        try {
            $expense = $this->approveUseCase->execute(
                $id,
                $user->tenant_id,
                $user->id,
                $request->validated('comment'),
            );
            $model = ExpenseModel::with(['approvalRecords.approver'])->find($expense->getId());
            return response()->json(new ExpenseResource($model));
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * 却下
     */
    public function reject(RejectExpenseRequest $request, string $id): JsonResponse
    {
        $user = auth()->user();

        try {
            $expense = $this->rejectUseCase->execute(
                $id,
                $user->tenant_id,
                $user->id,
                $request->validated('comment'),
            );
            $model = ExpenseModel::with(['approvalRecords.approver'])->find($expense->getId());
            return response()->json(new ExpenseResource($model));
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * 取り消し
     */
    public function cancel(string $id): JsonResponse
    {
        $user = auth()->user();
        $expense = ExpenseModel::where('tenant_id', $user->tenant_id)->findOrFail($id);

        if ($expense->applicant_id !== $user->id) {
            return response()->json(['message' => '自身の申請のみ取り消せます。'], 403);
        }
        if (in_array($expense->status, ['approved', 'paid'], true)) {
            return response()->json(['message' => '承認済み・支払済みは取り消せません。'], 422);
        }

        $expense->update(['status' => 'cancelled']);
        return response()->json(new ExpenseResource($expense->fresh()));
    }

    /**
     * CSVエクスポート（ストリーミング）
     */
    public function export(Request $request): StreamedResponse
    {
        $user = auth()->user();
        $dto = new ExpenseSearchDTO(
            tenantId: $user->tenant_id,
            status: $request->query('status'),
            dateFrom: $request->query('date_from'),
            dateTo: $request->query('date_to'),
        );

        $filename = 'expenses_' . now()->format('YmdHis') . '.csv';

        return response()->streamDownload(function () use ($dto) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel
            fputs($handle, "\xEF\xBB\xBF");

            foreach ($this->exportUseCase->execute($dto) as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * 承認履歴
     */
    public function history(string $id): JsonResponse
    {
        $user = auth()->user();
        $expense = ExpenseModel::where('tenant_id', $user->tenant_id)->findOrFail($id);
        $records = $expense->approvalRecords()->with('approver')->get();

        return response()->json([
            'data' => \App\Http\Resources\Expense\ApprovalRecordResource::collection($records),
        ]);
    }
}
