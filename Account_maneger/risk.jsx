import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AlertTriangle, Database, Cloud, Shield, Monitor, Clock, TrendingUp, CheckCircle, XCircle, Users, Code } from 'lucide-react';

const TechnicalDebtAnalyzer = () => {
  const [currentSystem, setCurrentSystem] = useState('モバイルサービス基盤');
  const [analysis, setAnalysis] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Googleが分類した10のカテゴリを基にした技術的負債分析
  const debtCategories = [
    {
      id: 'infrastructure',
      name: 'インフラ・運用負債',
      icon: <Database className="w-5 h-5" />,
      description: 'クラウドインフラ、監視、デプロイメントの負債',
      impact: 4,
      effort: 3,
      items: [
        'Legacy監視ツールの混在',
        'インフラのコード化不足',
        'セキュリティパッチの遅延',
        'ログの標準化不足'
      ],
      matsuzakiContext: '松崎さんはGrafana/CloudWatch統合で30%の改善実績があり、この領域での解決能力が高い'
    },
    {
      id: 'architecture',
      name: 'アーキテクチャ負債',
      icon: <Cloud className="w-5 h-5" />,
      description: 'システム設計、結合度、依存関係の問題',
      impact: 5,
      effort: 5,
      items: [
        '密結合なコンポーネント',
        'API設計の不整合',
        'データベース設計の問題',
        'スケーラビリティの制約'
      ],
      matsuzakiContext: 'AWS/GCPでの設計経験を活かし、段階的な改善が可能'
    },
    {
      id: 'security',
      name: 'セキュリティ負債',
      icon: <Shield className="w-5 h-5" />,
      description: 'セキュリティホール、認証・認可の不備',
      impact: 5,
      effort: 2,
      items: [
        '古いライブラリの使用',
        '認証機構の脆弱性',
        'ログ監査の不足',
        'データ暗号化の不備'
      ],
      matsuzakiContext: 'Twingateでゼロトラスト環境構築により80%削減の実績あり'
    },
    {
      id: 'maintainability',
      name: '保守性負債',
      icon: <Code className="w-5 h-5" />,
      description: 'コード品質、ドキュメント、テストの問題',
      impact: 3,
      effort: 3,
      items: [
        'ドキュメントの不足',
        'テストカバレッジの低さ',
        'コードレビュープロセス',
        'ナレッジ共有の仕組み'
      ],
      matsuzakiContext: '小規模チーム（2名）での効率的な改善が重要'
    },
    {
      id: 'performance',
      name: 'パフォーマンス負債',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'レスポンス、スループット、リソース効率',
      impact: 3,
      effort: 4,
      items: [
        'データベースクエリの最適化',
        'キャッシュ戦略の見直し',
        'リソース使用量の最適化',
        'CDN設定の改善'
      ],
      matsuzakiContext: '監視体制強化の経験を活かした最適化が可能'
    }
  ];

  // 松崎さんの実績を反映した分析結果
  const generateAnalysis = () => {
    const totalDebt = debtCategories.reduce((sum, cat) => sum + (cat.impact * cat.effort), 0);
    const riskScore = Math.min(100, (totalDebt / debtCategories.length) * 10);
    
    return {
      totalDebtScore: totalDebt,
      riskLevel: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
      priorityCategories: debtCategories.sort((a, b) => (b.impact * 1.5 + b.effort) - (a.impact * 1.5 + a.effort)),
      estimatedROI: {
        infrastructure: '6ヶ月で30%のコスト削減',
        security: '3ヶ月で80%のインシデント削減',
        architecture: '12ヶ月で開発効率50%向上'
      }
    };
  };

  useEffect(() => {
    setAnalysis(generateAnalysis());
  }, []);

  // 視覚化用データ
  const impactEffortData = debtCategories.map(cat => ({
    name: cat.name,
    impact: cat.impact,
    effort: cat.effort,
    priority: cat.impact * 1.5 + cat.effort
  }));

  const riskDistribution = [
    { name: 'High Risk', value: 2, color: '#ef4444' },
    { name: 'Medium Risk', value: 2, color: '#f59e0b' },
    { name: 'Low Risk', value: 1, color: '#10b981' }
  ];

  const trendData = [
    { month: '1月', debt: 65 },
    { month: '2月', debt: 70 },
    { month: '3月', debt: 68 },
    { month: '4月', debt: 72 },
    { month: '5月', debt: 69 },
    { month: '6月', debt: 67 }
  ];

  const qualityMetrics = [
    { metric: '監視体制', value: 85 }, // 松崎さんの実績を反映
    { metric: 'セキュリティ', value: 80 }, // Twingate導入の成果
    { metric: 'インフラ自動化', value: 60 },
    { metric: 'ドキュメント', value: 45 },
    { metric: 'テストカバレッジ', value: 40 },
    { metric: 'パフォーマンス', value: 65 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">技術的負債分析ツール 2025</h1>
              <p className="text-gray-600">松崎さんの実績を活かした戦略的な負債管理</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                className="px-4 py-2 border rounded-lg"
                value={currentSystem}
                onChange={(e) => setCurrentSystem(e.target.value)}
              >
                <option>モバイルサービス基盤</option>
                <option>Webアプリケーション</option>
                <option>データプラットフォーム</option>
              </select>
            </div>
          </div>
        </div>

        {analysis && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">総合リスクレベル</h3>
                    <p className={`text-2xl font-bold ${analysis.riskLevel === 'High' ? 'text-red-500' : analysis.riskLevel === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>
                      {analysis.riskLevel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">推定改善期間</h3>
                    <p className="text-2xl font-bold text-blue-600">6-12ヶ月</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">期待ROI</h3>
                    <p className="text-2xl font-bold text-green-600">40-80%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">チームサイズ</h3>
                    <p className="text-2xl font-bold text-purple-600">2名</p>
                  </div>
                </div>
              </div>
            </div>

            {/* メイン分析エリア */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* インパクト vs 工数マトリクス */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">負債カテゴリ分析（インパクト vs 工数）</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={impactEffortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impact" name="影響度" fill="#ef4444" />
                    <Bar dataKey="effort" name="工数" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* リスク分布 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">リスク分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {riskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="ml-2 text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* トレンドと品質メトリクス */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">負債トレンド（6ヶ月）</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="debt" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">品質メトリクス</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={qualityMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="現在値" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 詳細分析 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">カテゴリ別詳細分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {debtCategories.map((category) => (
                  <div 
                    key={category.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCategory === category.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {category.icon}
                        <h4 className="text-lg font-semibold ml-2">{category.name}</h4>
                      </div>
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          category.impact >= 4 ? 'bg-red-100 text-red-800' :
                          category.impact >= 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Impact: {category.impact}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          category.effort >= 4 ? 'bg-purple-100 text-purple-800' :
                          category.effort >= 3 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Effort: {category.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    
                    {selectedCategory === category.id && (
                      <div className="mt-3 space-y-2">
                        <h5 className="font-medium text-sm">主な課題:</h5>
                        <ul className="text-sm space-y-1">
                          {category.items.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                          <strong>松崎さんへの提案:</strong><br/>
                          {category.matsuzakiContext}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* アクションプラン */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">戦略的改善プラン</h3>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showRecommendations ? '非表示' : '詳細プラン表示'}
                </button>
              </div>

              {showRecommendations && (
                <div className="space-y-6">
                  {/* フェーズ1: 短期（1-3ヶ月） */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="text-lg font-semibold text-green-700 mb-2">フェーズ1: 短期改善（1-3ヶ月）</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">🛡️ セキュリティ負債の解消</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• ライブラリの最新化（自動化ツール導入）</li>
                          <li>• Twingateの設定最適化</li>
                          <li>• セキュリティパッチの定期適用</li>
                        </ul>
                        <p className="text-xs text-green-600 mt-2">期待効果: インシデント80%削減</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">📊 監視体制の強化</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Grafana ダッシュボードの拡張</li>
                          <li>• アラート設定の最適化</li>
                          <li>• ログ収集の標準化</li>
                        </ul>
                        <p className="text-xs text-green-600 mt-2">期待効果: 対応時間30%短縮</p>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ2: 中期（3-8ヶ月） */}
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="text-lg font-semibold text-orange-700 mb-2">フェーズ2: 中期改善（3-8ヶ月）</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">🏗️ インフラの自動化</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Infrastructure as Codeの導入</li>
                          <li>• CI/CDパイプラインの強化</li>
                          <li>• 環境構築の自動化</li>
                        </ul>
                        <p className="text-xs text-orange-600 mt-2">期待効果: デプロイ時間80%短縮</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">📚 ドキュメント整備</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• 運用手順書の標準化</li>
                          <li>• アーキテクチャ文書の作成</li>
                          <li>• ナレッジ共有の仕組み化</li>
                        </ul>
                        <p className="text-xs text-orange-600 mt-2">期待効果: オンボーディング50%改善</p>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ3: 長期（8-12ヶ月） */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="text-lg font-semibold text-purple-700 mb-2">フェーズ3: 長期戦略（8-12ヶ月）</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">🔄 アーキテクチャの改善</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• マイクロサービス化の検討</li>
                          <li>• API設計の統一</li>
                          <li>• データベース最適化</li>
                        </ul>
                        <p className="text-xs text-purple-600 mt-2">期待効果: スケーラビリティ2x向上</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">🎯 パフォーマンス最適化</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• レスポンス時間の改善</li>
                          <li>• リソース使用量の最適化</li>
                          <li>• キャッシュ戦略の見直し</li>
                        </ul>
                        <p className="text-xs text-purple-600 mt-2">期待効果: レスポンス60%改善</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">💡 松崎さんのスキルを活かした推奨アプローチ</h5>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li>• 監視改善の実績を他システムに横展開</li>
                      <li>• セキュリティ強化の知見をチーム全体で共有</li>
                      <li>• AWS/GCPの最新サービスを活用した段階的改善</li>
                      <li>• 技術ブログでの発信を通じた組織文化の醸成</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TechnicalDebtAnalyzer;
