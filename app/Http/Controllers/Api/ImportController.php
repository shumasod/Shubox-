<?php

namespace App\Http\Controllers\Api;

use App\Jobs\ImportExpensesCsv;
use App\Models\ExpenseImport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    private const MAX_FILE_SIZE  = 5 * 1024 * 1024; // 5 MB
    private const ALLOWED_MIMES  = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimes:csv,txt',
        ]);

        $file = $request->file('file');

        // Server-side MIME validation
        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_MIMES, strict: true)) {
            return response()->json(['message' => 'Only CSV files are accepted.'], 422);
        }

        $user     = Auth::user();
        $s3Key    = "imports/{$user->tenant_id}/" . Str::uuid() . '.csv';

        Storage::disk('s3')->put($s3Key, file_get_contents($file->getRealPath()), [
            'ServerSideEncryption' => 'aws:kms',
        ]);

        $import = ExpenseImport::create([
            'tenant_id'  => $user->tenant_id,
            'user_id'    => $user->id,
            's3_key'     => $s3Key,
            'filename'   => $file->getClientOriginalName(),
            'status'     => 'queued',
        ]);

        ImportExpensesCsv::dispatch(
            $import->id,
            $user->tenant_id,
            $user->id,
            $s3Key
        )->onQueue('imports');

        return response()->json([
            'import_id' => $import->id,
            'message'   => 'Import queued. You will be notified when processing is complete.',
        ], 202);
    }

    public function show(int $id): JsonResponse
    {
        $import = ExpenseImport::where('tenant_id', Auth::user()->tenant_id)
            ->findOrFail($id);

        return response()->json($import);
    }

    public function index(): JsonResponse
    {
        $imports = ExpenseImport::where('tenant_id', Auth::user()->tenant_id)
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json($imports);
    }
}
