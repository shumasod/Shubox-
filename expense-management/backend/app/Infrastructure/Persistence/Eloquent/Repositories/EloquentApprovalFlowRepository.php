<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Approval\Entities\ApprovalFlow;
use App\Domain\Approval\Entities\ApprovalStep;
use App\Domain\Approval\Repositories\ApprovalFlowRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\ApprovalFlowModel;
use Illuminate\Support\Str;

class EloquentApprovalFlowRepository implements ApprovalFlowRepositoryInterface
{
    public function findById(string $id, string $tenantId): ?ApprovalFlow
    {
        $model = ApprovalFlowModel::with('steps')
            ->where('tenant_id', $tenantId)
            ->find($id);

        return $model ? $this->toDomain($model) : null;
    }

    public function findDefault(string $tenantId): ?ApprovalFlow
    {
        $model = ApprovalFlowModel::with('steps')
            ->where('tenant_id', $tenantId)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function findAllActive(string $tenantId): array
    {
        return ApprovalFlowModel::with('steps')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn($m) => $this->toDomain($m))
            ->toArray();
    }

    public function save(ApprovalFlow $flow): void
    {
        $model = ApprovalFlowModel::firstOrNew(['id' => $flow->getId()]);
        $model->tenant_id   = $flow->getTenantId();
        $model->name        = $flow->getName();
        $model->description = $flow->getDescription();
        $model->is_default  = $flow->isDefault();
        $model->is_active   = $flow->isActive();
        $model->conditions  = $flow->getConditions();
        $model->save();
    }

    private function toDomain(ApprovalFlowModel $model): ApprovalFlow
    {
        $steps = $model->steps->map(fn($s) => new ApprovalStep(
            id:           $s->id,
            flowId:       $s->approval_flow_id,
            stepNumber:   $s->step_number,
            name:         $s->name,
            approverType: $s->approver_type,
            approverIds:  $s->approver_ids ?? [],
            isRequired:   $s->is_required,
        ))->toArray();

        return new ApprovalFlow(
            id:          $model->id,
            tenantId:    $model->tenant_id,
            name:        $model->name,
            description: $model->description,
            isDefault:   $model->is_default,
            isActive:    $model->is_active,
            conditions:  $model->conditions ?? [],
            steps:       $steps,
        );
    }
}
