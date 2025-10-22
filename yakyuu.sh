#!/bin/bash

# 色設定
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# チーム名
HOME_TEAM="ドラゴンズ"
AWAY_TEAM="タイガース"

# スコア
HOME_SCORE=0
AWAY_SCORE=0

# 試合状況
declare -a SCORE_BOARD

# 実況メッセージ表示
broadcast() {
    echo -e "${YELLOW}📻 実況:${NC} $1"
    sleep 1.5
}

# スコアボード表示
show_scoreboard() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "         ${BLUE}$AWAY_TEAM${NC}  vs  ${RED}$HOME_TEAM${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    printf "%-15s" "$AWAY_TEAM"
    for score in "${SCORE_BOARD[@]:0:9}"; do
        printf "%3s" "$score"
    done
    printf " | %3d\n" "$AWAY_SCORE"
    
    printf "%-15s" "$HOME_TEAM"
    for score in "${SCORE_BOARD[@]:9:9}"; do
        printf "%3s" "$score"
    done
    printf " | %3d\n" "$HOME_SCORE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# ランナー状況表示
show_runners() {
    local runners=$1
    echo ""
    if [ $runners -eq 0 ]; then
        echo "    ランナーなし"
    else
        echo "    ◇"
        echo "   ╱ ╲"
        [ $((runners & 4)) -ne 0 ] && echo -e "  ${GREEN}●${NC}   ${GREEN}●${NC}" || echo "  ◇   ◇"
        [ $((runners & 2)) -ne 0 ] && echo -e "   ╲${GREEN}●${NC}╱" || echo "   ╲◇╱"
        [ $((runners & 1)) -ne 0 ] && echo -e "    ${GREEN}●${NC}" || echo "    ◇"
    fi
    echo ""
}

# 打席結果生成
at_bat() {
    local rand=$((RANDOM % 100))
    local result=""
    local runs=0
    local runners=$1
    local outs=$2
    
    if [ $rand -lt 5 ]; then
        result="ホームラン"
        runs=$((1 + $(echo $runners | tr -cd '1' | wc -c)))
        broadcast "打った！大きい！入った！ホームラーーーーン！！"
        runners=0
    elif [ $rand -lt 15 ]; then
        result="ヒット"
        broadcast "よし！ヒット！ランナー進塁！"
        runs=0
        if [ $((runners & 4)) -ne 0 ]; then
            runs=$((runs + 1))
        fi
        runners=$(( (runners << 1 | 1) & 7 ))
    elif [ $rand -lt 25 ]; then
        result="ツーベース"
        broadcast "二塁打！ランナー一気に還ります！"
        [ $((runners & 4)) -ne 0 ] && runs=$((runs + 1))
        [ $((runners & 2)) -ne 0 ] && runs=$((runs + 1))
        runners=$(( ((runners & 1) << 1 | 2) & 7 ))
    elif [ $rand -lt 30 ]; then
        result="スリーベース"
        broadcast "三塁打！これは大きい！"
        [ $((runners & 4)) -ne 0 ] && runs=$((runs + 1))
        [ $((runners & 2)) -ne 0 ] && runs=$((runs + 1))
        [ $((runners & 1)) -ne 0 ] && runs=$((runs + 1))
        runners=4
    elif [ $rand -lt 45 ]; then
        result="四球"
        broadcast "フォアボール。ランナー出ます。"
        if [ $runners -eq 7 ]; then
            runs=1
        else
            runners=$(( (runners << 1 | 1) & 7 ))
            if [ $runners -gt 7 ]; then
                runs=1
                runners=7
            fi
        fi
    else
        result="アウト"
        broadcast "打ち上げた！アウト！"
        outs=$((outs + 1))
    fi
    
    echo "$result $runs $runners $outs"
}

# イニング実行
play_inning() {
    local inning=$1
    local is_bottom=$2
    local team_name=$3
    local outs=0
    local runners=0
    local inning_runs=0
    
    if [ $is_bottom -eq 0 ]; then
        echo -e "\n${BLUE}========== ${inning}回表 $team_name の攻撃 ==========${NC}\n"
    else
        echo -e "\n${RED}========== ${inning}回裏 $team_name の攻撃 ==========${NC}\n"
    fi
    
    while [ $outs -lt 3 ]; do
        echo -e "アウトカウント: ${outs} アウト"
        show_runners $runners
        
        result=$(at_bat $runners $outs)
        hit_type=$(echo $result | cut -d' ' -f1)
        runs=$(echo $result | cut -d' ' -f2)
        runners=$(echo $result | cut -d' ' -f3)
        outs=$(echo $result | cut -d' ' -f4)
        
        if [ $runs -gt 0 ]; then
            broadcast "${runs}点が入りました！"
            inning_runs=$((inning_runs + runs))
        fi
        
        sleep 1
    done
    
    broadcast "スリーアウト、チェンジ！"
    
    if [ $is_bottom -eq 0 ]; then
        SCORE_BOARD[$((inning - 1))]=$inning_runs
        AWAY_SCORE=$((AWAY_SCORE + inning_runs))
    else
        SCORE_BOARD[$((inning + 8))]=$inning_runs
        HOME_SCORE=$((HOME_SCORE + inning_runs))
    fi
}

# メイン
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "      ⚾  プロ野球実況中継  ⚾"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
broadcast "本日の対戦カード、${AWAY_TEAM}対${HOME_TEAM}！"
broadcast "それでは、プレイボール！"
sleep 2

# スコアボード初期化
for i in {0..17}; do
    SCORE_BOARD[$i]=0
done

# 9イニング
for inning in {1..9}; do
    play_inning $inning 0 $AWAY_TEAM
    show_scoreboard
    sleep 1
    
    # 9回裏でホームチームがリードしている場合は試合終了
    if [ $inning -eq 9 ] && [ $HOME_SCORE -gt $AWAY_SCORE ]; then
        broadcast "試合終了！${HOME_TEAM}の勝利です！"
        break
    fi
    
    play_inning $inning 1 $HOME_TEAM
    show_scoreboard
    sleep 1
done

# 最終結果
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $HOME_SCORE -gt $AWAY_SCORE ]; then
    broadcast "試合終了！${HOME_TEAM}が${HOME_SCORE}対${AWAY_SCORE}で勝利しました！"
elif [ $AWAY_SCORE -gt $HOME_SCORE ]; then
    broadcast "試合終了！${AWAY_TEAM}が${AWAY_SCORE}対${HOME_SCORE}で勝利しました！"
else
    broadcast "同点！延長戦に入ります！"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
