<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ImpersonationController extends Controller
{
    private const SESSION_KEY = 'impersonator_id';

    public function start(Request $request, int $userId): JsonResponse
    {
        $admin = Auth::user();

        if ($admin->role !== 'admin') {
            abort(403, 'Admin role required for impersonation.');
        }

        if (session()->has(self::SESSION_KEY)) {
            abort(422, 'Already impersonating a user. Stop the current session first.');
        }

        $target = User::where('tenant_id', $admin->tenant_id)
            ->where('id', '!=', $admin->id)
            ->findOrFail($userId);

        session()->put(self::SESSION_KEY, $admin->id);
        Auth::login($target);

        $this->audit($admin->id, $target->id, 'impersonation.start');

        Log::info('Admin impersonation started', [
            'admin_id'  => $admin->id,
            'target_id' => $target->id,
        ]);

        return response()->json([
            'message'   => "Now acting as {$target->name}.",
            'user'      => $target->only(['id', 'name', 'email', 'role']),
        ]);
    }

    public function stop(Request $request): JsonResponse
    {
        $impersonatorId = session()->pull(self::SESSION_KEY);

        if (!$impersonatorId) {
            abort(422, 'No active impersonation session.');
        }

        $currentUser = Auth::user();
        $admin = User::findOrFail($impersonatorId);

        Auth::login($admin);

        $this->audit($admin->id, $currentUser->id, 'impersonation.stop');

        Log::info('Admin impersonation stopped', [
            'admin_id'  => $admin->id,
            'target_id' => $currentUser->id,
        ]);

        return response()->json([
            'message' => 'Impersonation ended. Restored admin session.',
            'user'    => $admin->only(['id', 'name', 'email', 'role']),
        ]);
    }

    private function audit(int $adminId, int $targetId, string $action): void
    {
        AuditLog::create([
            'tenant_id'     => Auth::user()->tenant_id,
            'user_id'       => $adminId,
            'action'        => $action,
            'resource_type' => 'User',
            'resource_id'   => $targetId,
            'before'        => null,
            'after'         => null,
            'ip_address'    => request()->ip(),
        ]);
    }
}
