"""
競馬データとPersona Non Grata外交官ゲームの統合システム
外交官が各国の競馬場を訪問し、馬の成績から外交戦略を学ぶコンセプト
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
from dataclasses import dataclass
from typing import List, Dict, Optional
import json
from datetime import datetime, timedelta
import random

# ==================== 競馬データ取得モジュール ====================

class HorseRacingScraper:
    """netkeiba.comからレース結果をスクレイピング"""
    
    BASE_URL = "https://race.netkeiba.com/race/result.html"
    
    @staticmethod
    def scrape_race(race_id: str) -> pd.DataFrame:
        """
        netkeibaのレース結果ページからデータを取得
        
        Args:
            race_id: 例 '202101010101' (2021年1月1日 第1競走)
        
        Returns:
            DataFrame: [着順, 馬名, 騎手, 単勝オッズ, ブレード]
        """
        url = f"{HorseRacingScraper.BASE_URL}?race_id={race_id}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        try:
            res = requests.get(url, headers=headers, timeout=10)
            res.encoding = res.apparent_encoding
            
            soup = BeautifulSoup(res.text, "html.parser")
            table = soup.find("table", class_="RaceTable01")
            
            if not table:
                print(f"⚠️ テーブルが見つかりませんでした: {race_id}")
                return pd.DataFrame()
            
            rows = table.find_all("tr")[1:]  # ヘッダー除外
            
            data = []
            for row in rows:
                cols = row.find_all("td")
                if len(cols) < 5:
                    continue
                
                rank = cols[0].get_text(strip=True)
                horse = cols[3].get_text(strip=True)
                jockey = cols[6].get_text(strip=True)
                odds = cols[10].get_text(strip=True) if len(cols) > 10 else "N/A"
                weight = cols[4].get_text(strip=True) if len(cols) > 4 else "N/A"
                
                data.append({
                    "着順": rank,
                    "馬名": horse,
                    "騎手": jockey,
                    "単勝オッズ": odds,
                    "馬体重": weight
                })
            
            df = pd.DataFrame(data)
            return df
            
        except requests.RequestException as e:
            print(f"❌ スクレイピングエラー: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def get_multiple_races(race_ids: List[str]) -> Dict[str, pd.DataFrame]:
        """複数のレース結果を取得"""
        results = {}
        for race_id in race_ids:
            print(f"🏇 レース {race_id} を取得中...")
            df = HorseRacingScraper.scrape_race(race_id)
            results[race_id] = df
        return results


# ==================== 外交官ゲームデータ構造 ====================

@dataclass
class RaceAnalysis:
    """レース分析結果"""
    race_id: str
    winner: str
    favorite_odds: float
    win_horse: str
    accuracy: float
    country: str
    strategy: str


class DiplomatStrategy:
    """競馬の結果から外交戦略を生成"""
    
    @staticmethod
    def analyze_race_for_diplomacy(df: pd.DataFrame, country: str) -> RaceAnalysis:
        """
        レース結果を分析し、外交戦略を導出
        
        Args:
            df: レース結果のDataFrame
            country: 国名
        
        Returns:
            RaceAnalysis: 分析結果
        """
        if df.empty:
            return None
        
        # 1位の馬を取得
        winner = df[df["着順"] == "1"].iloc[0]["馬名"] if any(df["着順"] == "1") else "Unknown"
        
        # オッズから人気度を分析
        odds_values = pd.to_numeric(
            df["単勝オッズ"].str.replace(",", ""),
            errors="coerce"
        )
        avg_odds = odds_values.mean()
        
        # 国ごとの戦略マッピング
        strategies = {
            "日本": DiplomatStrategy._japan_strategy(df, avg_odds),
            "アメリカ": DiplomatStrategy._usa_strategy(df, avg_odds),
            "フランス": DiplomatStrategy._france_strategy(df, avg_odds),
            "ドイツ": DiplomatStrategy._germany_strategy(df, avg_odds),
            "中国": DiplomatStrategy._china_strategy(df, avg_odds),
        }
        
        strategy = strategies.get(country, "Standard diplomatic approach")
        accuracy = min(100, (1.0 / max(avg_odds, 1)) * 100)
        
        return RaceAnalysis(
            race_id="dummy",
            winner=winner,
            favorite_odds=avg_odds,
            win_horse=winner,
            accuracy=accuracy,
            country=country,
            strategy=strategy
        )
    
    @staticmethod
    def _japan_strategy(df: pd.DataFrame, odds: float) -> str:
        """日本：調和とプロセス重視"""
        if odds < 5:
            return "🇯🇵 強い馬が勝つ → 伝統と秩序を重視し、段階的な交渉を進める"
        elif odds < 10:
            return "🇯🇵 中程度の混戦 → チームワークと相互尊重で信頼を構築"
        else:
            return "🇯🇵 混戦模様 → 謙虚な姿勢で相手を尊重し、じっくり関係を深める"
    
    @staticmethod
    def _usa_strategy(df: pd.DataFrame, odds: float) -> str:
        """アメリカ：直接性と競争力重視"""
        if odds < 5:
            return "🇺🇸 優勢馬がいる → 明確な目標と自信を持って交渉を推し進める"
        elif odds < 10:
            return "🇺🇸 混戦模様 → 競争的だが公正な交渉姿勢を保つ"
        else:
            return "🇺🇸 予測困難 → 予測不可能な状況では柔軟性と創意を発揮"
    
    @staticmethod
    def _france_strategy(df: pd.DataFrame, odds: float) -> str:
        """フランス：美学と戦略性重視"""
        if odds < 5:
            return "🇫🇷 明確な優勝馬 → エレガントで洗練された交渉方針を貫く"
        elif odds < 10:
            return "🇫🇷 接戦模様 → 知的で創造的なアプローチで局面を打開"
        else:
            return "🇫🇷 乱戦 → 芸術的な交渉スタイルで相手を魅了する"
    
    @staticmethod
    def _germany_strategy(df: pd.DataFrame, odds: float) -> str:
        """ドイツ：秩序と効率重視"""
        if odds < 5:
            return "🇩🇪 強い優位性あり → 厳密なプロセスと効率で目標達成"
        elif odds < 10:
            return "🇩🇪 予測可能な展開 → 論理的で秩序立てた交渉を展開"
        else:
            return "🇩🇪 不確実性が高い → リスク分析と綿密な計画で対応"
    
    @staticmethod
    def _china_strategy(df: pd.DataFrame, odds: float) -> str:
        """中国：調和と長期視野重視"""
        if odds < 5:
            return "🇨🇳 予測通りの展開 → 関係構築を重視し、長期的な提携を模索"
        elif odds < 10:
            return "🇨🇳 適度な競争 → 相手の立場を理解し、協調路線を探る"
        else:
            return "🇨🇳 複雑な状況 → グループ全体の利益を考慮した提案をする"


# ==================== 統合ゲームシステム ====================

class DiplomatGameWithRacing:
    """競馬データを用いた外交官ゲーム"""
    
    def __init__(self):
        self.countries = {
            "日本": {"race_id": "202101010101"},
            "アメリカ": {"race_id": "202101010102"},
            "フランス": {"race_id": "202101010103"},
            "ドイツ": {"race_id": "202101010104"},
            "中国": {"race_id": "202101010105"},
        }
        self.game_data = {}
    
    def generate_simulated_race(self, country: str) -> pd.DataFrame:
        """
        実際のスクレイピングが難しい場合用のシミュレーションデータ
        """
        horses = {
            "日本": ["ディープインパクト", "キタサンブラック", "ステイゴールド"],
            "アメリカ": ["シービスケット", "マンオウォー", "アメリカン"],
            "フランス": ["トランスワイヨン", "モンジュー", "フランカー"],
            "ドイツ": ["プリューシューッセ", "ドイツライター", "ベルリンシュタルク"],
            "中国": ["チャイナゴールド", "龍翔", "中華ドリーム"],
        }
        
        country_horses = horses.get(country, ["馬A", "馬B", "馬C"])
        
        data = []
        for i, horse in enumerate(country_horses, 1):
            data.append({
                "着順": str(i),
                "馬名": horse,
                "騎手": f"騎手{i}",
                "単勝オッズ": str(round(random.uniform(2.0, 15.0), 1)),
                "馬体重": f"{400 + random.randint(0, 100)}kg"
            })
        
        return pd.DataFrame(data)
    
    def play_game_with_race_strategy(self):
        """ゲームをプレイ"""
        print("\n" + "="*60)
        print("🌍 Persona Non Grata - 競馬外交官エディション 🏇")
        print("="*60)
        print("\n各国の競馬場での戦績から外交戦略を学びます。\n")
        
        total_score = 0
        diplomatic_lessons = []
        
        for country, country_data in self.countries.items():
            print(f"\n📍 {country}を訪問中...\n")
            
            # レース分析（シミュレーション版）
            race_df = self.generate_simulated_race(country)
            print(f"🏇 {country}でのレース結果:\n")
            print(race_df.to_string(index=False))
            
            # 戦略分析
            analysis = DiplomatStrategy.analyze_race_for_diplomacy(race_df, country)
            
            if analysis:
                print(f"\n📊 分析結果:")
                print(f"   優勝馬: {analysis.win_horse}")
                print(f"   平均オッズ: {analysis.favorite_odds:.2f}")
                print(f"   外交精度: {analysis.accuracy:.1f}%")
                print(f"\n💡 外交戦略:\n   {analysis.strategy}")
                
                # スコア計算
                score = int(analysis.accuracy + random.randint(10, 30))
                total_score += score
                
                diplomatic_lessons.append({
                    "国": country,
                    "戦略": analysis.strategy,
                    "スコア": score
                })
            
            print("\n" + "-"*60)
        
        # 最終結果
        print(f"\n🎉 外交ミッション完了！\n")
        print(f"{'='*60}")
        print(f"最終スコア: {total_score}")
        print(f"{'='*60}\n")
        
        print("📚 習得した外交戦略:\n")
        for i, lesson in enumerate(diplomatic_lessons, 1):
            print(f"{i}. {lesson['国']} (スコア: {lesson['スコア']})")
            print(f"   └─ {lesson['戦略']}\n")
        
        return total_score, diplomatic_lessons
    
    def export_game_report(self, filename="diplomat_report.json"):
        """ゲームレポートをエクスポート"""
        score, lessons = self.play_game_with_race_strategy()
        
        report = {
            "title": "Persona Non Grata - 競馬外交官レポート",
            "date": datetime.now().isoformat(),
            "total_score": score,
            "diplomatic_strategies": lessons,
            "summary": f"5カ国での外交ミッション完了。獲得スコア: {score}点"
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ レポートを {filename} に保存しました。")
        return report


# ==================== 実行例 ====================

def main():
    """メイン実行"""
    
    # 1️⃣ スクレイピング例（実データ取得時）
    print("🔍 実装例 - netkeibaからレース結果を取得:")
    print("-" * 60)
    print("""
    # 実際のレース結果を取得する場合
    scraper = HorseRacingScraper()
    race_id = "202101010101"  # 2021年1月1日 第1レース
    df = scraper.scrape_race(race_id)
    
    if not df.empty:
        print("取得したレース結果:")
        print(df)
    """)
    
    # 2️⃣ ゲーム実行
    print("\n\n🎮 ゲーム実行:")
    print("-" * 60)
    
    game = DiplomatGameWithRacing()
    score, lessons = game.play_game_with_race_strategy()
    
    # 3️⃣ レポートエクスポート
    game.export_game_report()


if __name__ == "__main__":
    main()
