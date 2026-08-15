<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['tenant_id' => 1]);
        Sanctum::actingAs($this->user);
    }

    private function createNotification(bool $read = false): DatabaseNotification
    {
        $n = DatabaseNotification::create([
            'id'              => \Str::uuid(),
            'type'            => 'App\\Notifications\\TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id'   => $this->user->id,
            'data'            => ['title' => 'Test', 'body' => 'Hello'],
            'read_at'         => $read ? now() : null,
        ]);
        return $n;
    }

    public function test_index_returns_all_notifications(): void
    {
        $this->createNotification();
        $this->createNotification(read: true);

        $response = $this->getJson('/api/notifications');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertEquals(1, $response->json('unread_count'));
    }

    public function test_unread_only_filter(): void
    {
        $this->createNotification();
        $this->createNotification(read: true);

        $response = $this->getJson('/api/notifications?unread_only=1');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_mark_read_sets_read_at(): void
    {
        $n = $this->createNotification();

        $response = $this->patchJson("/api/notifications/{$n->id}/read");

        $response->assertOk();
        $this->assertNotNull($response->json('read_at'));
        $this->assertNotNull($n->fresh()->read_at);
    }

    public function test_mark_all_read(): void
    {
        $this->createNotification();
        $this->createNotification();

        $response = $this->postJson('/api/notifications/read-all');

        $response->assertOk();
        $this->assertEquals(2, $response->json('marked_read'));
        $this->assertEquals(0, $this->user->unreadNotifications()->count());
    }

    public function test_destroy_deletes_notification(): void
    {
        $n = $this->createNotification();

        $this->deleteJson("/api/notifications/{$n->id}")->assertNoContent();

        $this->assertDatabaseMissing('notifications', ['id' => $n->id]);
    }
}
