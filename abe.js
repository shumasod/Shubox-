<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>阿部寛のホームページ SRE改善提案</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: #333;
            line-height: 1.6;
        }
        .slide {
            min-height: 100vh;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: white;
            margin: 20px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }
        .slide::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71, #3498db);
        }
        h1 {
            font-size: 2.5em;
            margin: 0 0 20px 0;
            color: #2c3e50;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            font-size: 2em;
            margin: 0 0 30px 0;
            color: #34495e;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 10px;
        }
        h3 {
            font-size: 1.5em;
            color: #2c3e50;
            margin: 20px 0 15px 0;
        }
        .subtitle {
            font-size: 1.2em;
            color: #7f8c8d;
            margin-bottom: 40px;
        }
        .highlight {
            background: linear-gradient(120deg, #ff9a9e 0%, #fecfef 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #e74c3c;
        }
        .warning {
            background: linear-gradient(120deg, #ffeaa7 0%, #fab1a0 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #f39c12;
        }
        .success {
            background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #2ecc71;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
            width: 100%;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-top: 4px solid #3498db;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #e74c3c;
            display: block;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .improvement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin: 30px 0;
            width: 100%;
        }
        .improvement-card {
            background: #ffffff;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            border-top: 4px solid #2ecc71;
            text-align: left;
        }
        .improvement-card h4 {
            color: #27ae60;
            margin: 0 0 15px 0;
            font-size: 1.3em;
        }
        .metric {
            background: #f1f2f6;
            padding: 10px 15px;
            margin: 8px 0;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .before-after {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
            width: 100%;
        }
        .before, .after {
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .before {
            background: #ffebee;
            border-top: 4px solid #f44336;
        }
        .after {
            background: #e8f5e8;
            border-top: 4px solid #4caf50;
        }
        .timeline {
            position: relative;
            margin: 30px 0;
        }
        .timeline-item {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            border-left: 5px solid #3498db;
            position: relative;
        }
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 50%;
            width: 20px;
            height: 20px;
            background: #3498db;
            border-radius: 50%;
            transform: translateY(-50%);
        }
        .priority-high {
            border-left-color: #e74c3c !important;
        }
        .priority-high::before {
            background: #e74c3c !important;
        }
        .priority-medium {
            border-left-color: #f39c12 !important;
        }
        .priority-medium::before {
            background: #f39c12 !important;
        }
        .priority-low {
            border-left-color: #2ecc71 !important;
        }
        .priority-low::before {
            background: #2ecc71 !important;
        }
        .navigation {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }
        .nav-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }
        .nav-btn:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        }
        .nav-btn:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
            transform: none;
        }
        .slide-number {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(52, 152, 219, 0.1);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            color: #2c3e50;
        }
        .architecture-diagram {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border: 2px dashed #3498db;
        }
        .monitoring-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .dashboard-widget {
            background: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .dashboard-value {
            font-size: 2em;
            font-weight: bold;
            color: #2ecc71;
        }
        .emoji {
            font-size: 1.5em;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <!-- スライド1: タイトル -->
    <div class="slide">
        <div class="slide-number">1/10</div>
        <h1>🔧 阿部寛のホームページ<br>SRE改善提案</h1>
        <p class="subtitle">～参考文献に基づく包括的改善戦略～</p>
        <div class="stats">
            <div class="stat-card">
                <span class="stat-number">0.7秒</span>
                <div class="stat-label">現在のLCP</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">TBT=0ms</span>
                <div class="stat-label">ブロッキング時間</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">CLS=0</span>
                <div class="stat-label">レイアウトシフト</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">IPv6</span>
                <div class="stat-label">対応済み</div>
            </div>
        </div>
        <div class="highlight">
            <strong>目標：</strong>レトロデザインを維持しながら<br>
            現代的なSRE標準への適合
        </div>
    </div>

    <!-- スライド2: 現状の詳細分析 -->
    <div class="slide">
        <div class="slide-number">2/10</div>
        <h2>📊 詳細現状分析</h2>
        
        <div class="before-after">
            <div class="before">
                <h3>🔍 技術的現状</h3>
                <div class="metric">LCP: 0.7秒（良好）</div>
                <div class="metric">Speed Index: 0.2秒（優秀）</div>
                <div class="metric">TBT: 0ms（完璧）</div>
                <div class="metric">CLS: 0（理想的）</div>
                <div class="metric">IPv6対応済み</div>
                <div class="metric">HTTP/1.1のみ</div>
            </div>
            <div class="after">
                <h3>⚠️ 運用課題</h3>
                <div class="metric">2024年1月サーバーダウン発生</div>
                <div class="metric">HTTPS自動変換で表示不可</div>
                <div class="metric">監視・アラート体制不明</div>
                <div class="metric">障害対応手順未整備</div>
                <div class="metric">SLA未定義</div>
                <div class="metric">バックアップ体制不明</div>
            </div>
        </div>

        <div class="warning">
            <strong>⚡ クリティカル発見</strong><br>
            技術的パフォーマンスは優秀だが、<strong>運用面でのSRE体制が未整備</strong>
        </div>
    </div>

    <!-- スライド3: SRE改善戦略概要 -->
    <div class="slide">
        <div class="slide-number">3/10</div>
        <h2>🎯 SRE改善戦略</h2>
        
        <div class="improvement-grid">
            <div class="improvement-card">
                <h4>🔍 Observability強化</h4>
                <p>現在：監視なし<br>
                <strong>改善後：</strong>リアルタイム監視・アラート</p>
                <ul>
                    <li>アップタイム監視</li>
                    <li>パフォーマンス監視</li>
                    <li>ユーザー体験監視</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>⚡ 可用性向上</h4>
                <p>現在：シングルポイント障害<br>
                <strong>改善後：</strong>冗長化・自動復旧</p>
                <ul>
                    <li>CDN導入</li>
                    <li>マルチリージョン展開</li>
                    <li>自動フェイルオーバー</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>🛡️ セキュリティ強化</h4>
                <p>現在：HTTP、基本セキュリティ<br>
                <strong>改善後：</strong>現代的セキュリティ</p>
                <ul>
                    <li>HTTPS化（オプション）</li>
                    <li>DDoS対策</li>
                    <li>セキュリティヘッダー</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>🔄 運用自動化</h4>
                <p>現在：手動運用<br>
                <strong>改善後：</strong>Infrastructure as Code</p>
                <ul>
                    <li>自動デプロイ</li>
                    <li>設定管理</li>
                    <li>災害復旧計画</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- スライド4: 監視・アラート設計 -->
    <div class="slide">
        <div class="slide-number">4/10</div>
        <h2>📈 監視・アラート設計</h2>
        
        <div class="architecture-diagram">
            <h3>🎛️ 監視ダッシュボード設計</h3>
            <div class="monitoring-dashboard">
                <div class="dashboard-widget">
                    <div>アップタイム</div>
                    <div class="dashboard-value">99.97%</div>
                </div>
                <div class="dashboard-widget">
                    <div>平均応答時間</div>
                    <div class="dashboard-value">0.45s</div>
                </div>
                <div class="dashboard-widget">
                    <div>エラー率</div>
                    <div class="dashboard-value">0.01%</div>
                </div>
                <div class="dashboard-widget">
                    <div>同時接続数</div>
                    <div class="dashboard-value">1,247</div>
                </div>
            </div>
        </div>

        <div class="improvement-grid">
            <div class="improvement-card">
                <h4>🚨 クリティカルアラート</h4>
                <div class="metric">応答時間 > 1.0秒</div>
                <div class="metric">エラー率 > 1%</div>
                <div class="metric">5分間連続ダウン</div>
                <div class="metric">SSL証明書期限切れ</div>
            </div>
            
            <div class="improvement-card">
                <h4>⚠️ 警告アラート</h4>
                <div class="metric">応答時間 > 0.8秒</div>
                <div class="metric">エラー率 > 0.5%</div>
                <div class="metric">トラフィック急増</div>
                <div class="metric">ディスク使用率 > 80%</div>
            </div>
        </div>

        <div class="success">
            <strong>🎯 目標SLI設定</strong><br>
            • アップタイム: 99.9%以上<br>
            • 応答時間: P95で0.7秒以内<br>
            • エラー率: 0.1%以下
        </div>
    </div>

    <!-- スライド5: インフラ冗長化設計 -->
    <div class="slide">
        <div class="slide-number">5/10</div>
        <h2>🏗️ インフラ冗長化設計</h2>
        
        <div class="before-after">
            <div class="before">
                <h3>現在のアーキテクチャ</h3>
                <div class="architecture-diagram">
                    <p>🖥️ 単一サーバー<br>
                    ↓<br>
                    🌐 直接配信<br>
                    ↓<br>
                    👤 ユーザー</p>
                    <div class="warning" style="margin-top: 15px;">
                        <strong>リスク:</strong> シングルポイント障害
                    </div>
                </div>
            </div>
            
            <div class="after">
                <h3>改善後のアーキテクチャ</h3>
                <div class="architecture-diagram">
                    <p>🌍 CDN（Cloudflare）<br>
                    ↓ フェイルオーバー<br>
                    ⚖️ ロードバランサー<br>
                    ↓ 冗長化<br>
                    🖥️🖥️ マルチサーバー<br>
                    ↓<br>
                    👤 ユーザー</p>
                    <div class="success" style="margin-top: 15px;">
                        <strong>効果:</strong> 99.99%可用性実現
                    </div>
                </div>
            </div>
        </div>

        <div class="improvement-grid">
            <div class="improvement-card">
                <h4>🌐 CDN導入効果</h4>
                <ul>
                    <li>世界中での高速配信</li>
                    <li>DDoS攻撃対策</li>
                    <li>帯域幅コスト削減</li>
                    <li>オリジンサーバー負荷軽減</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>🔄 自動フェイルオーバー</h4>
                <ul>
                    <li>30秒以内の自動切り替え</li>
                    <li>ヘルスチェック機能</li>
                    <li>地理的分散配置</li>
                    <li>無停止メンテナンス</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- スライド6: セキュリティ強化（レトロ配慮） -->
    <div class="slide">
        <div class="slide-number">6/10</div>
        <h2>🛡️ セキュリティ強化戦略</h2>
        
        <div class="highlight">
            <strong>制約条件：</strong>レトロデザイン・軽量性を維持しながらセキュリティ向上
        </div>

        <div class="improvement-grid">
            <div class="improvement-card">
                <h4>🔐 HTTPS化（段階的導入）</h4>
                <p><strong>Phase 1:</strong> HTTP継続、HTTPS並行提供<br>
                <strong>Phase 2:</strong> 自動リダイレクト（オプション）<br>
                <strong>Phase 3:</strong> HSTS導入検討</p>
                <div class="metric">証明書: Let's Encrypt（無料）</div>
                <div class="metric">パフォーマンス影響: 最小限</div>
            </div>
            
            <div class="improvement-card">
                <h4>🛡️ DDoS対策</h4>
                <ul>
                    <li>CDNレベルでの攻撃遮断</li>
                    <li>レート制限設定</li>
                    <li>ボット検出・ブロック</li>
                    <li>地域別アクセス制御</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>📋 セキュリティヘッダー</h4>
                <div class="metric">X-Frame-Options: DENY</div>
                <div class="metric">X-Content-Type-Options: nosniff</div>
                <div class="metric">Referrer-Policy: no-referrer</div>
                <div class="metric">※軽量性維持のため最小限構成</div>
            </div>
            
            <div class="improvement-card">
                <h4>🔍 脆弱性監視</h4>
                <ul>
                    <li>定期的セキュリティスキャン</li>
                    <li>依存関係監視（最小限）</li>
                    <li>ログ監視・異常検知</li>
                    <li>インシデント対応計画</li>
                </ul>
            </div>
        </div>

        <div class="warning">
            <strong>⚖️ バランス重視</strong><br>
            セキュリティ vs 軽量性のトレードオフを慎重に検討
        </div>
    </div>

    <!-- スライド7: 災害復旧・継続性計画 -->
    <div class="slide">
        <div class="slide-number">7/10</div>
        <h2>🆘 災害復旧・継続性計画</h2>
        
        <div class="stats">
            <div class="stat-card">
                <span class="stat-number">RTO</span>
                <div class="stat-label">15分以内復旧</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">RPO</span>
                <div class="stat-label">1時間以内データ損失</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">99.99%</span>
                <div class="stat-label">目標可用性</div>
            </div>
        </div>

        <div class="timeline">
            <div class="timeline-item priority-high">
                <h4>🚨 即座対応（0-5分）</h4>
                <p><strong>自動：</strong>CDNキャッシュからの配信継続<br>
                <strong>自動：</strong>フェイルオーバー実行<br>
                <strong>手動：</strong>インシデント対応チーム招集</p>
            </div>
            
            <div class="timeline-item priority-medium">
                <h4>🔧 復旧作業（5-15分）</h4>
                <p><strong>診断：</strong>障害原因特定<br>
                <strong>復旧：</strong>バックアップサーバー起動<br>
                <strong>確認：</strong>サービス正常性検証</p>
            </div>
            
            <div class="timeline-item priority-low">
                <h4>📊 事後対応（15分-24時間）</h4>
                <p><strong>報告：</strong>ステークホルダーへの状況報告<br>
                <strong>分析：</strong>根本原因分析（RCA）実施<br>
                <strong>改善：</strong>再発防止策の実装</p>
            </div>
        </div>

        <div class="improvement-grid">
            <div class="improvement-card">
                <h4>💾 バックアップ戦略</h4>
                <ul>
                    <li>Git リポジトリでのソース管理</li>
                    <li>画像ファイルの複数拠点保存</li>
                    <li>設定ファイルの自動バックアップ</li>
                    <li>日次・週次バックアップ検証</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>📞 緊急時連絡体制</h4>
                <ul>
                    <li>24時間監視サービス</li>
                    <li>エスカレーション手順</li>
                    <li>関係者連絡先リスト</li>
                    <li>外部ベンダー連絡先</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- スライド8: 運用自動化・IaC -->
    <div class="slide">
        <div class="slide-number">8/10</div>
        <h2>🤖 運用自動化・Infrastructure as Code</h2>
        
        <div class="improvement-grid">
            <div class="improvement-card">
                <h4>📋 設定管理（Terraform）</h4>
                <div class="metric">resource "cloudflare_zone" "abe_hiroshi"</div>
                <div class="metric">resource "aws_s3_bucket" "backup"</div>
                <div class="metric">resource "datadog_monitor" "uptime"</div>
                <p>インフラ構成をコードで管理し、<br>再現可能なデプロイを実現</p>
            </div>
            
            <div class="improvement-card">
                <h4>🔄 CI/CDパイプライン</h4>
                <ul>
                    <li>Git push → 自動テスト実行</li>
                    <li>ステージング環境デプロイ</li>
                    <li>検証後、本番環境デプロイ</li>
                    <li>ロールバック機能</li>
                </ul>
            </div>
            
            <div class="improvement-card">
                <h4>🧪 自動テスト</h4>
                <div class="metric">パフォーマンステスト（LCP < 0.7s）</div>
                <div class="metric">機能テスト（全リンク動作確認）</div>
                <div class="metric">セキュリティテスト（脆弱性スキャン）</div>
                <div class="metric">アクセシビリティテスト</div>
            </div>
            
            <div class="improvement-card">
                <h4>📊 自動レポート</h4>
                <ul>
                    <li>日次パフォーマンスレポート</li>
                    <li>月次SLA達成率報告</li>
                    <li>セキュリティ監査レポート</li>
                    <li>コスト分析レポート</li>
                </ul>
            </div>
        </div>

        <div class="architecture-diagram">
            <h3>🔄 自動化ワークフロー</h3>
            <p>📝 コード変更 → 🧪 自動テスト → 🚀 ステージングデプロイ → ✅ 検証 → 🌐 本番デプロイ → 📊 監視・レポート</p>
        </div>
    </div>

    <!-- スライド9: 実装ロードマップ -->
    <div class="slide">
        <div class="slide-number">9/10</div>
        <h2>🗺️ 実装ロードマップ</h2>
        
        <div class="timeline">
            <div class="timeline-item priority-high">
                <h4>📅 Phase 1: 基盤整備（1-2ヶ月）</h4>
                <ul>
                    <li>監視・アラート体制構築</li>
                    <li>CDN導入によるパフォーマンス向上</li>
                    <li>基本的なバックアップ体制確立</li>
                    <li>インシデント対応手順策定</li>
                </ul>
                <div class="metric">予算目安: 月額 $200-500</div>
            </div>
            
            <div class="timeline-item priority-medium">
                <h4>📅 Phase 2: 可用性向上（2-3ヶ月）</h4>
                <ul>
                    <li
