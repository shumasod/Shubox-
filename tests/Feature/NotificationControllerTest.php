<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        $this->actingAs($this->user);
    }

    public function test_index_returns_paginated_notifications(): void
    {
        DatabaseNotification::insert([
            [
                'id'              => Str::uuid(),
                'type'            => 'App\\Notifications\\ExpenseApproved',
                'notifiable_type' => User::class,
                'notifiable_id'   => $this->user->id,
                'data'            => json_encode(['message' => 'Expense approved']),
                'read_at'         => null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
        ]);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'total', 'unread_count']]);
    }

    public function test_unread_only_filter(): void
    {
        $readId   = Str::uuid();
        $unreadId = Str::uuid();

        DatabaseNotification::insert([
            [
                'id'              => $readId,
                'type'            => 'App\\Notifications\\Test',
                'notifiable_type' => User::class,
                'notifiable_id'   => $this->user->id,
                'data'            => json_encode([]),
                'read_at'         => now(),
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
            [
                'id'              => $unreadId,
                'type'            => 'App\\Notifications\\Test',
                'notifiable_type' => User::class,
                'notifiable_id'   => $this->user->id,
                'data'            => json_encode([]),
                'read_at'         => null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
        ]);

        $response = $this->getJson('/api/notifications?unread_only=1')->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_mark_as_read(): void
    {
        $id = Str::uuid();
        DatabaseNotification::insert([[
            'id'              => $id,
            'type'            => 'App\\Notifications\\Test',
            'notifiable_type' => User::class,
            'notifiable_id'   => $this->user->id,
            'data'            => json_encode([]),
            'read_at'         => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]]);

        $this->patchJson("/api/notifications/{$id}/read")->assertOk();
        $this->assertNotNull(DatabaseNotification::find($id)->read_at);
    }

    public function test_mark_all_as_read(): void
    {
        DatabaseNotification::insert([[
            'id'              => Str::uuid(),
            'type'            => 'App\\Notifications\\Test',
            'notifiable_type' => User::class,
            'notifiable_id'   => $this->user->id,
            'data'            => json_encode([]),
            'read_at'         => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]]);

        $this->postJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('marked_count', 1);
    }

    public function test_destroy_deletes_notification(): void
    {
        $id = Str::uuid();
        DatabaseNotification::insert([[
            'id'              => $id,
            'type'            => 'App\\Notifications\\Test',
            'notifiable_type' => User::class,
            'notifiable_id'   => $this->user->id,
            'data'            => json_encode([]),
            'read_at'         => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]]);

        $this->deleteJson("/api/notifications/{$id}")->assertNoContent();
        $this->assertNull(DatabaseNotification::find($id));
    }
}
