// AWSコストリアルタイムモニタリングダッシュボード
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// AWSコストデータを取得する関数
const fetchAWSCostData = async () => {
  try {
    // APIエンドポイントの設定 - 実際の環境に合わせて変更してください
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';
    
    // 各データを並行して取得
    const [monthlyCostResponse, dailyCostResponse, serviceCostResponse, alertsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/costs/monthly`),
      fetch(`${API_BASE_URL}/api/costs/daily`),
      fetch(`${API_BASE_URL}/api/costs/by-service`),
      fetch(`${API_BASE_URL}/api/alerts`)
    ]);
    
    // レスポンスをJSONに変換
    const monthlyCost = await monthlyCostResponse.json();
    const dailyCost = await dailyCostResponse.json();
    const serviceCost = await serviceCostResponse.json();
    const alerts = await alertsResponse.json();
    
    // すべてのデータを1つのオブジェクトにまとめて返す
    return {
      monthlyCost,
      dailyCost,
      serviceCost,
      alerts
    };
  } catch (error) {
    console.error('Error fetching AWS cost data:', error);
    throw error;
  }
};

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

  // データロード関数
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchAWSCostData();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('データの取得に失敗しました: ' + (err.message || '不明なエラー'));
    } finally {
      setLoading(false);
    }
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
          <p className="mt-2">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラーの表示
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
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

  // データが無い場合
  if (!data) {
    return null;
  }

  // 月次の累計コスト
  const currentMonthCost = data.monthlyCost[data.monthlyCost.length - 1].total;
  const prevMonthCost = data.monthlyCost[data.monthlyCost.length - 2].total;
  const monthlyDiff = currentMonthCost - prevMonthCost;
  const monthlyDiffPercent = ((monthlyDiff / prevMonthCost) * 100).toFixed(1);

  // 日次の最新コスト
  const latestDailyCost = data.dailyCost[data.dailyCost.length - 1].total;
  const prevDailyCost = data.dailyCost[data.dailyCost.length - 2].total;
  const dailyDiff = latestDailyCost - prevDailyCost;
  const dailyDiffPercent = ((dailyDiff / prevDailyCost) * 100).toFixed(1);

  return (
    <div className="p-4 max-w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AWSコストリアルタイムモニタリング</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            最終更新: {lastUpdated.toLocaleString()}
          </span>
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
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            今すぐ更新
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
              {formatCurrency(data.monthlyCost[data.monthlyCost.length - 1].prod)}
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              ({((data.monthlyCost[data.monthlyCost.length - 1].prod / currentMonthCost) * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">総コストに対する割合</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">開発環境コスト</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(data.monthlyCost[data.monthlyCost.length - 1].dev)}
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              ({((data.monthlyCost[data.monthlyCost.length - 1].dev / currentMonthCost) * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">総コストに対する割合</div>
        </div>
      </div>
      
      {/* グラフとアラートのセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 月次トレンドグラフ */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">月次コスト推移</h3>
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
        
        {/* アラート */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">アラート</h3>
            <button className="text-sm text-blue-500 hover:text-blue-700">すべて見る</button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`border-l-4 p-3 rounded-r ${getAlertColor(alert.severity)}`}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs text-gray-500">{alert.timestamp}</div>
                </div>
              </div>
            ))}
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
          <h3 className="text-lg font-medium mb-4">サービス別コスト</h3>
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
