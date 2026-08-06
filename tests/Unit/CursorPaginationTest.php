<?php

namespace Tests\Unit;

use App\Models\Expense;
use App\Traits\HasCursorPagination;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class CursorPaginationTest extends TestCase
{
    use RefreshDatabase;
    use HasCursorPagination;

    public function test_first_page_returns_correct_count(): void
    {
        $user = \App\Models\User::factory()->create(['tenant_id' => 1]);
        Expense::factory()->count(25)->create(['tenant_id' => 1, 'user_id' => $user->id]);

        $request = Request::create('/', 'GET', ['limit' => 10]);
        $result  = $this->paginateWithCursor(
            Expense::where('tenant_id', 1),
            $request,
            10
        );

        $this->assertCount(10, $result['data']);
        $this->assertTrue($result['has_more']);
        $this->assertNotNull($result['next_cursor']);
    }

    public function test_cursor_returns_next_page(): void
    {
        $user = \App\Models\User::factory()->create(['tenant_id' => 1]);
        Expense::factory()->count(15)->create(['tenant_id' => 1, 'user_id' => $user->id]);

        $request1 = Request::create('/', 'GET', ['limit' => 10]);
        $page1    = $this->paginateWithCursor(Expense::where('tenant_id', 1), $request1, 10);

        $request2 = Request::create('/', 'GET', ['limit' => 10, 'cursor' => $page1['next_cursor']]);
        $page2    = $this->paginateWithCursor(Expense::where('tenant_id', 1), $request2, 10);

        $this->assertCount(5, $page2['data']);
        $this->assertFalse($page2['has_more']);
        $this->assertNull($page2['next_cursor']);

        // No overlap between pages
        $ids1 = $page1['data']->pluck('id')->all();
        $ids2 = $page2['data']->pluck('id')->all();
        $this->assertEmpty(array_intersect($ids1, $ids2));
    }

    public function test_limit_capped_at_100(): void
    {
        $request = Request::create('/', 'GET', ['limit' => 999]);
        $result  = $this->paginateWithCursor(Expense::query(), $request);
        $this->assertSame(100, $result['limit']);
    }
}
