// AWS Cost Explorer APIを使用したコストモニタリングダッシュボード
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// AWS Cost Explorer APIクライアントのセットアップ
// 注意: 実際の環境では、AWS SDK for JavaScript v3を使用し、
// 適切な認証情報を設定してください

class CostExplorerService {
  constructor() {
    // 実際の環境では、AWS.config.update()またはAWS SDKのCredentialsProviderを使用
    this.region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
    this.apiEndpoint = `https://ce.${this.region}.amazonaws.com`;
  }

  // Cost Explorer APIを呼び出すためのヘルパー関数
  async callCostExplorerAPI(operation, params) {
    try {
      // 実際の環境では、AWS SDK v3のCostExplorerClientを使用
      // この例では、プロキシサーバーまたはLambda関数経由でAPIを呼び出すことを想定
      const response = await fetch('/api/cost-explorer/' + operation, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}` // 実際の認証方式に応じて変更
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling Cost Explorer API (${operation}):`, error);
      throw error;
    }
  }

  // 月次コストデータを取得
  async getMonthlyCostData() {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
    
    const params = {
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0]
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'TAG',
          Key: 'Environment' // 本番/開発環境の分類用
        }
      ]
    };

    const response = await this.callCostExplorerAPI('GetCostAndUsage', params);
    return this.transformMonthlyCostData(response);
  }

  // 日次コストデータを取得 (過去30日間)
  async getDailyCostData() {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const params = {
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0]
      },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'TAG',
          Key: 'Environment'
        }
      ]
    };

    const response = await this.callCostExplorerAPI('GetCostAndUsage', params);
    return this.transformDailyCostData(response);
  }

  // サービス別コストデータを取得
  async getServiceCostData() {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const params = {
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0]
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'SERVICE'
        }
      ]
    };

    const response = await this.callCostExplorerAPI('GetCostAndUsage', params);
    return this.transformServiceCostData(response);
  }

  // コスト異常検知データを取得
  async getCostAnomalies() {
    const params = {
      DateInterval: {
        StartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 過去7日
        EndDate: new Date().toISOString().split('T')[0]
      },
      MaxResults: 10
    };

    try {
      const response = await this.callCostExplorerAPI('GetAnomalies', params);
      return this.transformAnomalyData(response);
    } catch (error) {
      console.warn('Cost anomaly detection not available or configured:', error);
      return []; // フォールバック
    }
  }

  // 月次データの変換
  transformMonthlyCostData(response) {
    return response.ResultsByTime?.map(result => {
      const date = result.TimePeriod.Start;
      let total = 0;
      let prod = 0;
      let dev = 0;

      result.Groups?.forEach(group => {
        const cost = parseFloat(group.Metrics.BlendedCost.Amount);
        const environment = group.Keys[0];
        
        total += cost;
        if (environment === 'production' || environment === 'prod') {
          prod += cost;
        } else if (environment === 'development' || environment === 'dev') {
          dev += cost;
        }
      });

      return {
        date: new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
        total: total,
        prod: prod,
        dev: dev
      };
    }) || [];
  }

  // 日次データの変換
  transformDailyCostData(response) {
    return response.ResultsByTime?.map(result => {
      const date = result.TimePeriod.Start;
      let total = 0;
      let prod = 0;
      let dev = 0;

      result.Groups?.forEach(group => {
        const cost = parseFloat(group.Metrics.BlendedCost.Amount);
        const environment = group.Keys[0];
        
        total += cost;
        if (environment === 'production' || environment === 'prod') {
          prod += cost;
        } else if (environment === 'development' || environment === 'dev') {
          dev += cost;
        }
      });

      return {
        date: new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        total: total,
        prod: prod,
        dev: dev
      };
    }) || [];
  }

  // サービス別データの変換
  transformServiceCostData(response) {
    const serviceCosts = [];
    
    response.ResultsByTime?.[0]?.Groups?.forEach(group => {
      const serviceName = group.Keys[0];
      const cost = parseFloat(group.Metrics.BlendedCost.Amount);
      
      if (cost > 0.01) { // $0.01以上のサービスのみ表示
        serviceCosts.push({
          service: serviceName.length > 15 ? serviceName.substring(0, 15) + '...' : serviceName,
          cost: cost
        });
      }
    });

    // コスト順にソートして上位10件を返す
    return serviceCosts.sort((a, b) => b.cost - a.cost).slice(0, 10);
  }

  // 異常検知データの変換
  transformAnomalyData(response) {
    return response.Anomalies?.map(anomaly => ({
      id: anomaly.AnomalyId,
      message: `${anomaly.RootCauses?.[0]?.Service || 'Unknown'}: $${anomaly.Impact.TotalImpact.toFixed(2)}の異常増加`,
      severity: anomaly.Impact.TotalImpact > 100 ? 'high' : anomaly.Impact.TotalImpact > 50 ? 'medium' : 'low',
      timestamp: new Date(anomaly.AnomalyStartDate).toLocaleString('ja-JP'),
      impact: anomaly.Impact.TotalImpact
    })) || [];
  }
}

// アラートの重要度に基づく色を返す関数
const getAlertColor = (severity) => {
  switch (severity) {
    case 'high': return 'bg-red-100 border-red-500 text-red-700';
    case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    case 'low': return 'bg-blue-100 border-blue-500 text-blue-700';
    default: return 'bg-gray-100 border-gray-500 text-gray-700';
  }
};

// 通貨フォーマット関数
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// メインダッシュボードコンポーネント
const AWSDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5); // 分単位
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Cost Explorer サービスのインスタンス
  const costExplorerService = new CostExplorerService();

  // データロード関数
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cost Explorer APIからデータを並行取得
      const [monthlyCost, dailyCost, serviceCost, alerts] = await Promise.all([
        costExplorerService.getMonthlyCostData(),
        costExplorerService.getDailyCostData(),
        costExplorerService.getServiceCostData(),
        costExplorerService.getCostAnomalies()
      ]);

      setData({
        monthlyCost,
        dailyCost,
        serviceCost,
        alerts
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Data loading error:', err);
      setError('AWS Cost Explorer APIからのデータ取得に失敗しました: ' + (err.message || '不明なエラー'));
      
      // フォールバックデータ（デモ用）
      if (!data) {
        setData(generateFallbackData());
      }
    } finally {
      setLoading(false);
    }
  };

  // フォールバックデータ生成（デモ用）
  const generateFallbackData = () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const monthlyCost = months.map((month, index) => ({
      date: month,
      total: 1000 + Math.random() * 500,
      prod: 700 + Math.random() * 300,
      dev: 300 + Math.random() * 200
    }));

    const dailyCost = Array.from({ length: 30 }, (_, index) => ({
      date: `${index + 1}`,
      total: 30 + Math.random() * 20,
      prod: 20 + Math.random() * 15,
      dev: 10 + Math.random() * 10
    }));

    const serviceCost = [
      { service: 'EC2-Instance', cost: 450.23 },
      { service: 'S3', cost: 123.45 },
      { service: 'RDS', cost: 234.56 },
      { service: 'Lambda', cost: 45.67 },
      { service: 'CloudFront', cost: 67.89 }
    ];

    const alerts = [
      {
        id: '1',
        message: 'EC2コストが予算の80%に到達',
        severity: 'medium',
        timestamp: new Date().toLocaleString('ja-JP')
      },
      {
        id: '2',
        message: 'S3使用量が急増',
        severity: 'low',
        timestamp: new Date(Date.now() - 3600000).toLocaleString('ja-JP')
      }
    ];

    return { monthlyCost, dailyCost, serviceCost, alerts };
  };

  // 初回ロードと定期更新
  useEffect(() => {
    loadData();
    
    // 定期更新のインターバル設定
    const intervalId = setInterval(() => {
      loadData();
    }, refreshInterval * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // 更新間隔変更ハンドラ
  const handleRefreshIntervalChange = (e) => {
    setRefreshInterval(parseInt(e.target.value));
  };

  // ローディング中の表示
  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2">AWS Cost Explorer APIからデータを取得中...</p>
        </div>
      </div>
    );
  }

  // データが無い場合
  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p>データの取得に失敗しました</p>
          {error && <p className="text-sm mt-2">{error}</p>}
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={loadData}
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // 月次の累計コスト計算
  const currentMonthCost = data.monthlyCost.length > 0 ? data.monthlyCost[data.monthlyCost.length - 1].total : 0;
  const prevMonthCost = data.monthlyCost.length > 1 ? data.monthlyCost[data.monthlyCost.length - 2].total : currentMonthCost;
  const monthlyDiff = currentMonthCost - prevMonthCost;
  const monthlyDiffPercent = prevMonthCost > 0 ? ((monthlyDiff / prevMonthCost) * 100).toFixed(1) : '0.0';

  // 日次の最新コスト計算
  const latestDailyCost = data.dailyCost.length > 0 ? data.dailyCost[data.dailyCost.length - 1].total : 0;
  const prevDailyCost = data.dailyCost.length > 1 ? data.dailyCost[data.dailyCost.length - 2].total : latestDailyCost;
  const dailyDiff = latestDailyCost - prevDailyCost;
  const dailyDiffPercent = prevDailyCost > 0 ? ((dailyDiff / prevDailyCost) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-4 max-w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AWS Cost Explorer ダッシュボード</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            最終更新: {lastUpdated.toLocaleString()}
          </span>
          {error && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              ⚠️ フォールバックデータ使用中
            </span>
          )}
          <div className="flex items-center">
            <label htmlFor="refresh" className="mr-2 text-sm">更新間隔:</label>
            <select 
              id="refresh" 
              value={refreshInterval}
              onChange={handleRefreshIntervalChange}
              className="border rounded p-1 text-sm"
            >
              <option value="1">1分</option>
              <option value="5">5分</option>
              <option value="15">15分</option>
              <option value="30">30分</option>
              <option value="60">1時間</option>
            </select>
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50"
          >
            {loading ? '更新中...' : '今すぐ更新'}
          </button>
        </div>
      </div>
      
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">今月の総コスト</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(currentMonthCost)}
            </div>
            <div className={`ml-2 text-sm font-medium ${monthlyDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyDiff < 0 ? '▼' : '▲'} {Math.abs(monthlyDiffPercent)}%
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">前月比</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">本日のコスト</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(latestDailyCost)}
            </div>
            <div className={`ml-2 text-sm font-medium ${dailyDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dailyDiff < 0 ? '▼' : '▲'} {Math.abs(dailyDiffPercent)}%
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">前日比</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">本番環境コスト</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(data.monthlyCost.length > 0 ? data.monthlyCost[data.monthlyCost.length - 1].prod : 0)}
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              ({currentMonthCost > 0 ? ((data.monthlyCost[data.monthlyCost.length - 1]?.prod / currentMonthCost) * 100).toFixed(1) : 0}%)
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">総コストに対する割合</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">開発環境コスト</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(data.monthlyCost.length > 0 ? data.monthlyCost[data.monthlyCost.length - 1].dev : 0)}
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              ({currentMonthCost > 0 ? ((data.monthlyCost[data.monthlyCost.length - 1]?.dev / currentMonthCost) * 100).toFixed(1) : 0}%)
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">総コストに対する割合</div>
        </div>
      </div>
      
      {/* グラフとアラートのセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 月次トレンドグラフ */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">月次コスト推移 (Cost Explorer API)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyCost} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="total" name="総コスト" fill="#4caf50" />
                <Bar dataKey="prod" name="本番環境" fill="#f44336" />
                <Bar dataKey="dev" name="開発環境" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* アラート・異常検知 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">コスト異常検知</h3>
            <button className="text-sm text-blue-500 hover:text-blue-700">詳細を見る</button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.alerts.length > 0 ? data.alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`border-l-4 p-3 rounded-r ${getAlertColor(alert.severity)}`}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs text-gray-500">{alert.timestamp}</div>
                </div>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4">
                現在、異常は検出されていません
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 日次トレンドとサービス別コスト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 日次トレンド */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">日次コスト推移 (過去30日間)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyCost} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total" name="総コスト" stroke="#4caf50" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prod" name="本番環境" stroke="#f44336" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="dev" name="開発環境" stroke="#2196f3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* サービス別コスト */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">サービス別コスト (Top 10)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={data.serviceCost} 
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="cost" name="コスト" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSDashboard;
