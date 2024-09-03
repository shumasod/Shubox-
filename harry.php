// database/migrations/2023_09_03_000000_create_scores_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateScoresTable extends Migration
{
    public function up()
    {
        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->string('player_name');
            $table->integer('score');
            $table->integer('rounds');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('scores');
    }
}

// app/Models/Score.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $fillable = ['player_name', 'score', 'rounds'];
}

// app/Http/Controllers/GameController.php
<?php

namespace App\Http\Controllers;

use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class GameController extends Controller
{
    private $spells = [
        'ルーモス' => ['damage' => 10, 'effect' => 'light'],
        'エクスペクト・パトローナム' => ['damage' => 20, 'effect' => 'patronus'],
        'エクスペリアームス' => ['damage' => 15, 'effect' => 'disarm'],
        'ウィンガーディアム・レビオサ' => ['damage' => 5, 'effect' => 'levitate'],
        'プロテゴ' => ['damage' => 0, 'effect' => 'shield'],
    ];

    public function index()
    {
        Session::forget('game_state');
        $topScores = Score::orderBy('score', 'desc')->take(5)->get();
        return view('game.index', ['topScores' => $topScores]);
    }

    public function play(Request $request)
    {
        $gameState = Session::get('game_state', [
            'player_name' => $request->input('player_name', 'プレイヤー'),
            'player_health' => 100,
            'dumbledore_health' => 100,
            'player_level' => 1,
            'player_exp' => 0,
            'round' => 0,
            'player_effects' => [],
            'dumbledore_effects' => [],
            'score' => 0,
        ]);

        $playerSpell = $request->input('spell');
        $dumbledoreSpell = $this->chooseDumbledoreSpell($gameState);

        $result = $this->resolveSpells($playerSpell, $dumbledoreSpell, $gameState);

        $gameState['player_health'] = max(0, min(100, $gameState['player_health'] + $result['player_damage']));
        $gameState['dumbledore_health'] = max(0, min(100, $gameState['dumbledore_health'] + $result['dumbledore_damage']));
        $gameState['round']++;
        $gameState['score'] += abs($result['dumbledore_damage']);

        // レベルアップのロジック
        $gameState['player_exp'] += 10;
        if ($gameState['player_exp'] >= 100) {
            $gameState['player_level']++;
            $gameState['player_exp'] -= 100;
        }

        if ($gameState['player_health'] <= 0 || $gameState['dumbledore_health'] <= 0) {
            $this->saveScore($gameState);
        }

        Session::put('game_state', $gameState);

        return view('game.play', [
            'gameState' => $gameState,
            'playerSpell' => $playerSpell,
            'dumbledoreSpell' => $dumbledoreSpell,
            'result' => $result,
            'spells' => $this->spells,
        ]);
    }

    private function resolveSpells($playerSpell, $dumbledoreSpell, &$gameState)
    {
        $playerSpellInfo = $this->spells[$playerSpell];
        $dumbledoreSpellInfo = $this->spells[$dumbledoreSpell];

        $playerDamage = -$this->calculateDamage($playerSpellInfo, $gameState['player_level'], $gameState['dumbledore_effects']);
        $dumbledoreDamage = -$this->calculateDamage($dumbledoreSpellInfo, 10, $gameState['player_effects']);

        // 特殊効果の適用
        $this->applyEffect($playerSpellInfo['effect'], 'player', $gameState);
        $this->applyEffect($dumbledoreSpellInfo['effect'], 'dumbledore', $gameState);

        return [
            'player_damage' => $playerDamage,
            'dumbledore_damage' => $dumbledoreDamage,
        ];
    }

    private function calculateDamage($spellInfo, $casterLevel, $targetEffects)
    {
        $damage = $spellInfo['damage'] * (1 + ($casterLevel - 1) * 0.1);
        
        if (in_array('shield', $targetEffects)) {
            $damage *= 0.5;
        }

        if (in_array('disarm', $targetEffects)) {
            $damage *= 0.75;
        }

        return round($damage);
    }

    private function applyEffect($effect, $target, &$gameState)
    {
        $effectsKey = $target . '_effects';
        $gameState[$effectsKey][] = $effect;
        
        // 効果は1ターンのみ持続
        if (count($gameState[$effectsKey]) > 1) {
            array_shift($gameState[$effectsKey]);
        }

        // 特殊効果の実装
        switch ($effect) {
            case 'light':
                // 次のターンの攻撃力が10%上昇
                $gameState[$target . '_light_boost'] = 1.1;
                break;
            case 'patronus':
                // 体力を10回復
                $healthKey = $target . '_health';
                $gameState[$healthKey] = min(100, $gameState[$healthKey] + 10);
                break;
            case 'levitate':
                // 次の攻撃を20%の確率で回避
                $gameState[$target . '_levitate'] = 0.2;
                break;
        }
    }

    private function chooseDumbledoreSpell($gameState)
    {
        // ダンブルドアのAI改善
        if ($gameState['dumbledore_health'] < 30) {
            // 体力が低い場合、回復呪文を優先
            return 'エクスペクト・パトローナム';
        } elseif ($gameState['player_health'] > 70) {
            // プレイヤーの体力が高い場合、強力な攻撃呪文を使用
            return 'エクスペリアームス';
        } elseif (empty($gameState['dumbledore_effects'])) {
            // 効果がかかっていない場合、防御呪文を使用
            return 'プロテゴ';
        } else {
            // それ以外の場合、ランダムに選択
            return array_rand($this->spells);
        }
    }

    private function saveScore($gameState)
    {
        Score::create([
            'player_name' => $gameState['player_name'],
            'score' => $gameState['score'],
            'rounds' => $gameState['round'],
        ]);
    }
}

// resources/views/game/index.blade.php
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ダンブルドアゲーム</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; }
        .start-form { margin: 20px 0; }
        .top-scores { margin-top: 30px; }
    </style>
</head>
<body>
    <h1>ダンブルドアゲームへようこそ</h1>
    <p>ダンブルドア教授との魔法の決闘に挑戦しましょう！</p>
    
    <form action="{{ route('game.play') }}" method="POST" class="start-form">
        @csrf
        <input type="text" name="player_name" placeholder="プレイヤー名を入力" required>
        <button type="submit">ゲームを開始</button>
    </form>

    <div class="top-scores">
        <h2>トップスコア</h2>
        <ol>
            @foreach($topScores as $score)
                <li>{{ $score->player_name }} - {{ $score->score }}点 ({{ $score->rounds }}ラウンド)</li>
            @endforeach
        </ol>
    </div>
</body>
</html>

// resources/views/game/play.blade.php
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ダンブルドアゲーム - プレイ中</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; }
        .health-bar { width: 200px; height: 20px; background-color: #ddd; margin: 10px auto; }
        .health-bar div { height: 100%; background-color: #4CAF50; }
        .spell-button { margin: 5px; padding: 10px 20px; }
        .effects { font-style: italic; color: #666; }
    </style>
</head>
<body>
    <h1>ダンブルドアとの決闘</h1>
    
    <h2>{{ $gameState['player_name'] }} (レベル {{ $gameState['player_level'] }})</h2>
    <div class="health-bar">
        <div style="width: {{ $gameState['player_health'] }}%;"></div>
    </div>
    <p>体力: {{ $gameState['player_health'] }}/100</p>
    <p>経験値: {{ $gameState['player_exp'] }}/100</p>
    <p class="effects">効果: {{ implode(', ', $gameState['player_effects']) }}</p>

    <h2>ダンブルドア</h2>
    <div class="health-bar">
        <div style="width: {{ $gameState['dumbledore_health'] }}%;"></div>
    </div>
    <p>体力: {{ $gameState['dumbledore_health'] }}/100</p>
    <p class="effects">効果: {{ implode(', ', $gameState['dumbledore_effects']) }}</p>

    <h3>ラウンド: {{ $gameState['round'] }} | スコア: {{ $gameState['score'] }}</h3>

    @if($gameState['round'] > 0)
        <p>あなたの呪文: {{ $playerSpell }} (ダメージ: {{ -$result['dumbledore_damage'] }})</p>
        <p>ダンブルドアの呪文: {{ $dumbledoreSpell }} (ダメージ: {{ -$result['player_damage'] }})</p>
    @endif

    @if($gameState['player_health'] <= 0)
        <h2>ゲームオーバー！ダンブルドアの勝利です。</h2>
    @elseif($gameState['dumbledore_health'] <= 0)
        <h2>おめでとうございます！あなたの勝利です。</h2>
    @else
        <form action="{{ route('game.play') }}" method="POST">
            @csrf
            @foreach($spells as $spell => $info)
                <button type="submit" name="spell" value="{{ $spell }}" class="spell-button">
                    {{ $spell }} (ダメージ: {{ $info['damage'] }}, 効果: {{ $info['effect'] }})
                </button>
            @endforeach
        </form>
    @endif

    <a href="{{ route('game.index') }}">ゲームをリセット</a>
</body>
</html>
