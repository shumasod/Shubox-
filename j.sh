#!/bin/bash

# 色設定
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# チーム名
HOME_TEAM="浦和レッズ"
AWAY_TEAM="鹿島アントラーズ"

# スコア
HOME_SCORE=0
AWAY_SCORE=0

# 統計
HOME_SHOTS=0
AWAY_SHOTS=0
HOME_POSSESSION=0
AWAY_POSSESSION=0
HOME_YELLOW=0
AWAY_YELLOW=0

# 得点者記録
declare -a HOME_SCORERS
declare -a AWAY_SCORERS

# 実況メッセージ表示
broadcast() {
    echo -e "${YELLOW}📻 実況:${NC} $1"
    sleep 1
}

# スコアボード表示
show_scoreboard() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "         ${BLUE}$AWAY_TEAM${NC}  vs  ${RED}$HOME_TEAM${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    printf "%-20s %2d  -  %-2d %s\n" "$AWAY_TEAM" "$AWAY_SCORE" "$HOME_SCORE" "$HOME_TEAM"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 統計表示
show_stats() {
    local total=$((HOME_POSSESSION + AWAY_POSSESSION))
    if [ $total -gt 0 ]; then
        local home_pct=$((HOME_POSSESSION * 100 / total))
        local away_pct=$((AWAY_POSSESSION * 100 / total))
    else
        local home_pct=50
        local away_pct=50
    fi
    
    echo "📊 試合統計"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    printf "%-20s   %20s\n" "$AWAY_TEAM" "$HOME_TEAM"
    echo "────────────────────────────────────────────"
    printf "シュート数: %-10d   %10d\n" "$AWAY_SHOTS" "$HOME_SHOTS"
    printf "ポゼッション: %d%%%-7s   %7s%d%%\n" "$away_pct" "" "" "$home_pct"
    printf "イエローカード: %-6d   %10d\n" "$AWAY_YELLOW" "$HOME_YELLOW"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# ゴールシーン
goal_scene() {
    local team=$1
    local minute=$2
    local scorer_num=$((RANDOM % 23 + 1))
    
    echo ""
    echo -e "${GREEN}⚽ ゴーーーーーール！！！${NC}"
    echo ""
    
    if [ "$team" = "home" ]; then
        HOME_SCORE=$((HOME_SCORE + 1))
        HOME_SCORERS+=("$minute' #$scorer_num")
        broadcast "$HOME_TEAM が得点！！ スコアは $AWAY_SCORE - $HOME_SCORE になりました！"
    else
        AWAY_SCORE=$((AWAY_SCORE + 1))
        AWAY_SCORERS+=("$minute' #$scorer_num")
        broadcast "$AWAY_TEAM が得点！！ スコアは $AWAY_SCORE - $HOME_SCORE になりました！"
    fi
    
    sleep 2
}

# 攻撃シーン生成
attack_scene() {
    local minute=$1
    local team=$2
    local team_name=$3
    
    echo -e "\n${CYAN}⏱  ${minute}分${NC}"
    
    local rand=$((RANDOM % 100))
    
    if [ $rand -lt 3 ]; then
        # ゴール！
        broadcast "$team_name の攻撃！ドリブルで持ち上がる！"
        sleep 0.5
        broadcast "パスが通った！ペナルティエリア内！"
        sleep 0.5
        broadcast "シュート！！！"
        sleep 1
        goal_scene "$team" "$minute"
        if [ "$team" = "home" ]; then
            HOME_SHOTS=$((HOME_SHOTS + 1))
        else
            AWAY_SHOTS=$((AWAY_SHOTS + 1))
        fi
        
    elif [ $rand -lt 12 ]; then
        # シュート（外れる）
        broadcast "$team_name の攻撃、前線へロングパス！"
        sleep 0.5
        broadcast "こぼれ球を拾った！シュート！"
        sleep 0.8
        
        local miss=$((RANDOM % 3))
        if [ $miss -eq 0 ]; then
            broadcast "ポスト直撃！惜しい！"
        elif [ $miss -eq 1 ]; then
            broadcast "枠を捉えられず！"
        else
            broadcast "ゴールキーパー、ファインセーブ！"
        fi
        
        if [ "$team" = "home" ]; then
            HOME_SHOTS=$((HOME_SHOTS + 1))
        else
            AWAY_SHOTS=$((AWAY_SHOTS + 1))
        fi
        
    elif [ $rand -lt 20 ]; then
        # コーナーキック
        broadcast "$team_name、コーナーキックを獲得！"
        sleep 0.5
        broadcast "キッカーは蹴り込んだ！"
        sleep 0.5
        
        if [ $((RANDOM % 10)) -eq 0 ]; then
            broadcast "ヘディングシュート！！"
            sleep 0.8
            goal_scene "$team" "$minute"
            if [ "$team" = "home" ]; then
                HOME_SHOTS=$((HOME_SHOTS + 1))
            else
                AWAY_SHOTS=$((AWAY_SHOTS + 1))
            fi
        else
            broadcast "クリアされた！"
        fi
        
    elif [ $rand -lt 28 ]; then
        # フリーキック
        broadcast "$team_name、フリーキックのチャンス！"
        sleep 0.5
        
        if [ $((RANDOM % 15)) -eq 0 ]; then
            broadcast "直接狙う！見事なシュート！！"
            sleep 1
            goal_scene "$team" "$minute"
            if [ "$team" = "home" ]; then
                HOME_SHOTS=$((HOME_SHOTS + 1))
            else
                AWAY_SHOTS=$((AWAY_SHOTS + 1))
            fi
        else
            broadcast "壁に当たった！"
        fi
        
    elif [ $rand -lt 35 ]; then
        # イエローカード
        broadcast "激しいタックル！"
        sleep 0.5
        broadcast "審判、カードを出した！イエローカードです！"
        
        if [ "$team" = "home" ]; then
            AWAY_YELLOW=$((AWAY_YELLOW + 1))
        else
            HOME_YELLOW=$((HOME_YELLOW + 1))
        fi
        
    elif [ $rand -lt 65 ]; then
        # パス回し
        local action=$((RANDOM % 5))
        if [ $action -eq 0 ]; then
            broadcast "$team_name、ボールをキープ。丁寧にパスを回します。"
        elif [ $action -eq 1 ]; then
            broadcast "$team_name のサイド攻撃、クロスを上げる！クリアされた。"
        elif [ $action -eq 2 ]; then
            broadcast "$team_name、中盤でボールを奪った！カウンター！...カットされた。"
        elif [ $action -eq 3 ]; then
            broadcast "$team_name、スルーパスを狙うも、オフサイド！"
        else
            broadcast "$team_name の攻撃、相手守備に阻まれた。"
        fi
        
        if [ "$team" = "home" ]; then
            HOME_POSSESSION=$((HOME_POSSESSION + 1))
        else
            AWAY_POSSESSION=$((AWAY_POSSESSION + 1))
        fi
    fi
    
    sleep 0.3
}

# ハーフ実行
play_half() {
    local half=$1
    local half_name=$2
    local start_min=$3
    local end_min=$4
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "         ${CYAN}$half_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    for ((min=$start_min; min<=$end_min; min+=5)); do
        # ランダムにどちらのチームが攻撃するか
        if [ $((RANDOM % 2)) -eq 0 ]; then
            attack_scene "$min" "home" "$HOME_TEAM"
        else
            attack_scene "$min" "away" "$AWAY_TEAM"
        fi
    done
    
    # アディショナルタイム
    local additional=$((RANDOM % 4 + 1))
    broadcast "アディショナルタイムは${additional}分です。"
    
    for ((i=1; i<=$additional; i++)); do
        local min=$((end_min + i))
        if [ $((RANDOM % 2)) -eq 0 ]; then
            attack_scene "${end_min}+${i}" "home" "$HOME_TEAM"
        else
            attack_scene "${end_min}+${i}" "away" "$AWAY_TEAM"
        fi
    done
    
    if [ "$half_name" = "前半" ]; then
        broadcast "前半終了のホイッスル！"
        show_scoreboard
        show_stats
        echo ""
        broadcast "15分間のハーフタイムです。"
        sleep 2
    else
        broadcast "試合終了！！"
    fi
}

# メイン
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "      ⚽  Jリーグ実況中継  ⚽"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
broadcast "本日の一戦、${HOME_TEAM}対${AWAY_TEAM}！"
broadcast "両チーム、ピッチに入場してきました！"
broadcast "それでは、キックオフ！"
sleep 2

# 前半
play_half 1 "前半" 0 45

# 後半
play_half 2 "後半" 46 90

# 最終結果
echo ""
show_scoreboard
show_stats

echo "🎯 得点者"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#AWAY_SCORERS[@]} -gt 0 ]; then
    echo "$AWAY_TEAM:"
    for scorer in "${AWAY_SCORERS[@]}"; do
        echo "  ⚽ $scorer"
    done
else
    echo "$AWAY_TEAM: なし"
fi
echo ""
if [ ${#HOME_SCORERS[@]} -gt 0 ]; then
    echo "$HOME_TEAM:"
    for scorer in "${HOME_SCORERS[@]}"; do
        echo "  ⚽ $scorer"
    done
else
    echo "$HOME_TEAM: なし"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $HOME_SCORE -gt $AWAY_SCORE ]; then
    broadcast "${HOME_TEAM}が${HOME_SCORE}対${AWAY_SCORE}で勝利しました！"
elif [ $AWAY_SCORE -gt $HOME_SCORE ]; then
    broadcast "${AWAY_TEAM}が${AWAY_SCORE}対${HOME_SCORE}で勝利しました！"
else
    broadcast "引き分け！${HOME_SCORE}対${AWAY_SCORE}で試合終了です！"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "      お疲れ様でした！⚽"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
