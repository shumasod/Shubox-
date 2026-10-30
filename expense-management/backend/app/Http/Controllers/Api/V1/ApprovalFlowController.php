<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Approval\Repositories\ApprovalFlowRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Models\ApprovalFlowModel;
use App\Infrastructure\Persistence\Eloquent\Models\ApprovalStepModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApprovalFlowController extends Controller
{
    public function __construct(
        private readonly ApprovalFlowRepositoryInterface $repository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $flows = ApprovalFlowModel::with('steps')
            ->where('tenant_id', $tenantId)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn($f) => $this->formatFlow($f));

        return response()->json(['data' => $flows]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $flow     = ApprovalFlowModel::with('steps')->where('tenant_id', $tenantId)->findOrFail($id);

        return response()->json(['data' => $this->formatFlow($flow)]);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId  = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:100'],
            'description'       => ['nullable', 'string', 'max:500'],
            'is_default'        => ['boolean'],
            'conditions'        => ['nullable', 'array'],
            'conditions.min_amount' => ['nullable', 'integer', 'min:0'],
            'conditions.max_amount' => ['nullable', 'integer', 'min:0'],
            'conditions.category_ids' => ['nullable', 'array'],
            'steps'             => ['required', 'array', 'min:1'],
            'steps.*.name'          => ['required', 'string', 'max:100'],
            'steps.*.approver_type' => ['required', 'in:specific_user,department_head,any_admin'],
            'steps.*.approver_ids'  => ['nullable', 'array'],
            'steps.*.is_required'   => ['boolean'],
        ]);

        if (!empty($validated['is_default'])) {
            ApprovalFlowModel::where('tenant_id', $tenantId)->update(['is_default' => false]);
        }

        $flow = ApprovalFlowModel::create([
            'id'          => Str::uuid()->toString(),
            'tenant_id'   => $tenantId,
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_default'  => $validated['is_default'] ?? false,
            'is_active'   => true,
            'conditions'  => $validated['conditions'] ?? [],
        ]);

        foreach ($validated['steps'] as $i => $step) {
            ApprovalStepModel::create([
                'id'               => Str::uuid()->toString(),
                'approval_flow_id' => $flow->id,
                'step_number'      => $i + 1,
                'name'             => $step['name'],
                'approver_type'    => $step['approver_type'],
                'approver_ids'     => $step['approver_ids'] ?? [],
                'is_required'      => $step['is_required'] ?? true,
            ]);
        }

        $flow->load('steps');

        return response()->json(['data' => $this->formatFlow($flow)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $flow     = ApprovalFlowModel::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_default'  => ['boolean'],
            'is_active'   => ['boolean'],
            'conditions'  => ['nullable', 'array'],
        ]);

        if (!empty($validated['is_default'])) {
            ApprovalFlowModel::where('tenant_id', $tenantId)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $flow->update($validated);
        $flow->load('steps');

        return response()->json(['data' => $this->formatFlow($flow)]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $flow     = ApprovalFlowModel::where('tenant_id', $tenantId)->findOrFail($id);

        if ($flow->is_default) {
            return response()->json(['message' => 'デフォルトの承認フローは削除できません'], 422);
        }

        $flow->delete();

        return response()->json(null, 204);
    }

    private function formatFlow(ApprovalFlowModel $model): array
    {
        return [
            'id'          => $model->id,
            'name'        => $model->name,
            'description' => $model->description,
            'is_default'  => $model->is_default,
            'is_active'   => $model->is_active,
            'conditions'  => $model->conditions,
            'steps'       => $model->steps->sortBy('step_number')->map(fn($s) => [
                'id'            => $s->id,
                'step_number'   => $s->step_number,
                'name'          => $s->name,
                'approver_type' => $s->approver_type,
                'approver_ids'  => $s->approver_ids,
                'is_required'   => $s->is_required,
            ])->values(),
            'created_at'  => $model->created_at->toIso8601String(),
            'updated_at'  => $model->updated_at->toIso8601String(),
        ];
    }
}
