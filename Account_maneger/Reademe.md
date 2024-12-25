Laravel + Livewireを使用したアカウント管理システムの実装手順について、より詳細な説明を追加させていただきます：

# アカウント管理システムの実装手順

## 1. コントローラの作成と実装

```bash
php artisan make:controller AccountController
```

### AccountController の実装例

```php
namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    // アカウント一覧表示
    public function index()
    {
        return view('accounts.index');
    }

    // アカウント作成フォーム表示
    public function create()
    {
        return view('accounts.create');
    }

    // アカウント保存処理
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:accounts',
            'password' => 'required|min:8|confirmed',
        ]);

        $account = Account::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('accounts.index')
            ->with('success', 'アカウントが作成されました');
    }

    // アカウント編集フォーム表示
    public function edit(Account $account)
    {
        return view('accounts.edit', compact('account'));
    }

    // アカウント更新処理
    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:accounts,email,' . $account->id,
        ]);

        $account->update($validated);

        return redirect()->route('accounts.index')
            ->with('success', 'アカウントが更新されました');
    }
}
```

## 2. ルーティングの設定

`routes/web.php` に以下のルートを追加：

```php
use App\Http\Controllers\AccountController;

Route::middleware(['auth'])->group(function () {
    Route::resource('accounts', AccountController::class);
});
```

## 3. Livewireコンポーネントの作成と実装

```bash
php artisan make:livewire AccountList
```

### Livewireコンポーネントクラスの実装 (app/Http/Livewire/AccountList.php)

```php
namespace App\Http\Livewire;

use App\Models\Account;
use Livewire\Component;
use Livewire\WithPagination;

class AccountList extends Component
{
    use WithPagination;

    public $search = '';
    public $sortField = 'created_at';
    public $sortDirection = 'desc';

    protected $queryString = ['search', 'sortField', 'sortDirection'];

    public function sortBy($field)
    {
        $this->sortDirection = $this->sortField === $field 
            ? $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc'
            : 'asc';

        $this->sortField = $field;
    }

    public function render()
    {
        return view('livewire.account-list', [
            'accounts' => Account::search($this->search)
                ->orderBy($this->sortField, $this->sortDirection)
                ->paginate(10)
        ]);
    }
}
```

### Livewireコンポーネントビューの実装 (resources/views/livewire/account-list.blade.php)

```php
<div>
    <div class="mb-4">
        <input wire:model.debounce.300ms="search" type="text" 
               placeholder="検索..." 
               class="form-input rounded-md shadow-sm mt-1 block w-full" />
    </div>

    <table class="min-w-full divide-y divide-gray-200">
        <thead>
            <tr>
                <th wire:click="sortBy('name')" class="cursor-pointer px-6 py-3 bg-gray-50">
                    名前
                    @if ($sortField === 'name')
                        <span>{!! $sortDirection === 'asc' ? '↑' : '↓' !!}</span>
                    @endif
                </th>
                <th wire:click="sortBy('email')" class="cursor-pointer px-6 py-3 bg-gray-50">
                    メールアドレス
                </th>
                <th class="px-6 py-3 bg-gray-50">
                    操作
                </th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            @foreach ($accounts as $account)
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">{{ $account->name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ $account->email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="{{ route('accounts.edit', $account) }}" 
                           class="text-indigo-600 hover:text-indigo-900">編集</a>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="mt-4">
        {{ $accounts->links() }}
    </div>
</div>
```

## 4. アカウントモデルの作成

```bash
php artisan make:model Account -m
```

### マイグレーションファイルの実装

```php
public function up()
{
    Schema::create('accounts', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->timestamps();
        $table->softDeletes();
    });
}
```

### モデルの実装

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'like', '%'.$term.'%')
                  ->orWhere('email', 'like', '%'.$term.'%');
        });
    }
}
```

## 主な機能

- アカウントの一覧表示（ページネーション付き）
- 検索機能（名前・メールアドレスで検索可能）
- ソート機能（各カラムでソート可能）
- アカウントの作成・編集・更新
- バリデーション処理
- ソフトデリート対応

## セキュリティ対策

- パスワードのハッシュ化
- CSRF対策
- バリデーションによる入力値チェック
- 認証済みユーザーのみアクセス可能

これにより、セキュアで使いやすいアカウント管理システムを実装することができます。
