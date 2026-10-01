<?php

namespace Tests\Feature;

use App\Jobs\ImportExpensesCsv;
use App\Models\ExpenseImport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImportControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('s3');
        Queue::fake();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        Sanctum::actingAs($this->user);
    }

    public function test_upload_valid_csv_returns_202(): void
    {
        $csv = UploadedFile::fake()->createWithContent(
            'expenses.csv',
            "title,amount,expense_date,currency\nTaxi,1500,2024-01-15,JPY\n"
        );

        $response = $this->postJson('/api/imports', ['file' => $csv]);

        $response->assertStatus(202);
        $response->assertJsonStructure(['import_id', 'message']);
        Queue::assertPushed(ImportExpensesCsv::class);
    }

    public function test_upload_non_csv_file_rejected(): void
    {
        $file = UploadedFile::fake()->create('malware.exe', 100, 'application/octet-stream');

        $response = $this->postJson('/api/imports', ['file' => $file]);

        $response->assertStatus(422);
        Queue::assertNotPushed(ImportExpensesCsv::class);
    }

    public function test_file_stored_on_s3_with_kms(): void
    {
        $csv = UploadedFile::fake()->createWithContent(
            'expenses.csv',
            "title,amount,expense_date,currency\nHotel,25000,2024-01-20,JPY\n"
        );

        $this->postJson('/api/imports', ['file' => $csv])->assertStatus(202);

        $import = ExpenseImport::first();
        Storage::disk('s3')->assertExists($import->s3_key);
    }

    public function test_show_returns_import_status(): void
    {
        $import = ExpenseImport::factory()->create([
            'tenant_id' => 1,
            'user_id'   => $this->user->id,
            'status'    => 'completed',
        ]);

        $this->getJson("/api/imports/{$import->id}")->assertOk()
            ->assertJsonPath('status', 'completed');
    }

    public function test_cross_tenant_import_returns_404(): void
    {
        $import = ExpenseImport::factory()->create(['tenant_id' => 99, 'user_id' => $this->user->id]);

        $this->getJson("/api/imports/{$import->id}")->assertNotFound();
    }

    public function test_index_returns_last_20_imports(): void
    {
        ExpenseImport::factory()->count(25)->create([
            'tenant_id' => 1,
            'user_id'   => $this->user->id,
        ]);

        $response = $this->getJson('/api/imports');

        $response->assertOk();
        $this->assertCount(20, $response->json());
    }

    public function test_missing_file_returns_422(): void
    {
        $this->postJson('/api/imports', [])->assertStatus(422);
    }

    public function test_oversized_file_returns_422(): void
    {
        $csv = UploadedFile::fake()->create('big.csv', 6000); // 6MB > 5MB limit

        $this->postJson('/api/imports', ['file' => $csv])->assertStatus(422);
    }
}
