import React, { useState, useEffect } from ‘react’;
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from ‘recharts’;

// AIOps分析エンジン
class AIOpsAnalyzer {
constructor() {
this.models = {
costPrediction: null,
anomalyDetection: null,
seasonalAnalysis: null
};
}

// 移動平均の計算
calculateMovingAverage(data, window = 7) {
return data.map((item, index) => {
if (index < window - 1) return { …item, movingAvg: item.total };

```
  const sum = data.slice(index - window + 1, index + 1)
    .reduce((acc, curr) => acc + curr.total, 0);
  return { ...item, movingAvg: sum / window };
});
```

}

// 季節性分析
analyzeSeasonality(data) {
const weeklyPattern = Array(7).fill(0);
const counts = Array(7).fill(0);

```
data.forEach((item, index) => {
  const dayOfWeek = index % 7;
  weeklyPattern[dayOfWeek] += item.total;
  counts[dayOfWeek]++;
});

return {
  weekly: weeklyPattern.map((sum, i) => ({
    day: ['日', '月', '火', '水', '木', '金', '土'][i],
    average: counts[i] > 0 ? sum / counts[i] : 0
  }))
};
```

}

// 線形回帰による予測
predictCosts(data, days = 7) {
if (data.length < 2) return [];

```
const x = data.map((_, i) => i);
const y = data.map(d => d.total);

const n = data.length;
const sumX = x.reduce((a, b) => a + b, 0);
const sumY = y.reduce((a, b) => a + b, 0);
const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;

const predictions = [];
for (let i = 0; i < days; i++) {
  const futureX = n + i;
  const predictedY = slope * futureX + intercept;
  predictions.push({
    date: `予測${i + 1}日目`,
    predicted: Math.max(0, predictedY),
    upper: Math.max(0, predictedY * 1.2),
    lower: Math.max(0, predictedY * 0.8)
  });
}

return predictions;
```

}

// 異常検知（Z-score方式）
detectAnomalies(data, threshold = 2.5) {
if (data.length < 3) return [];

```
const values = data.map(d => d.total);
const mean = values.reduce((a, b) => a + b, 0) / values.length;
const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
const stdDev = Math.sqrt(variance);

return data.map((item, index) => {
  const zScore = stdDev > 0 ? Math.abs(item.total - mean) / stdDev : 0;
  const isAnomaly = zScore > threshold;
  
  return {
    ...item,
    zScore,
    isAnomaly,
    severity: zScore > 3 ? 'high' : zScore > 2 ? 'medium' : 'low',
    index: index
  };
}).filter(item => item.isAnomaly);
```

}

// コスト効率性分析
analyzeCostEfficiency(serviceCosts) {
return serviceCosts.map(service => {
const efficiency = Math.random() * 0.5 + 0.3; // デモ用ランダム値

```
  return {
    ...service,
    efficiency: efficiency,
    recommendation: this.generateRecommendation(service, efficiency)
  };
});
```

}

// レコメンデーション生成
generateRecommendation(service, efficiency) {
if (efficiency < 0.3) {
return `${service.service}: 使用率が低いため、インスタンスサイズの見直しを推奨`;
} else if (efficiency > 0.8) {
return `${service.service}: 高効率で運用中`;
} else if (service.cost > 500) {
return `${service.service}: コストが高いため、Reserved Instancesの検討を推奨`;
}
return `${service.service}: 適切に運用されています`;
}

// リアルタイム異常スコアの計算
calculateRealTimeAnomalyScore(currentValue, historicalData) {
if (historicalData.length < 10) return { score: 0, level: ‘normal’ };

```
const recent = historicalData.slice(-14).map(d => d.total);
const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
const stdDev = Math.sqrt(recent.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / recent.length);

const score = stdDev > 0 ? Math.abs(currentValue - mean) / stdDev : 0;

let level = 'normal';
if (score > 3) level = 'critical';
else if (score > 2) level = 'warning';
else if (score > 1.5) level = 'caution';

return { score: score.toFixed(2), level };
```

}
}

// Cost Explorer Service（デモデータ用）
class CostExplorerService {
constructor() {
this.aiops = new AIOpsAnalyzer();
}

async getMonthlyCostData() {
// デモデータ
const months = [‘1月’, ‘2月’, ‘3月’, ‘4月’, ‘5月’, ‘6月’];
return months.map((month, index) => ({
date: month,
total: 1000 + Math.random() * 500,
prod: 700 + Math.random() * 300,
dev: 300 + Math.random() * 200
}));
}

async getDailyCostData() {
// デモデータ
const data = Array.from({ length: 60 }, (_, index) => ({
date: `${index + 1}`,
total: 30 + Math.random() * 20 + Math.sin(index / 7) * 10,
prod: 20 + Math.random() * 15,
dev: 10 + Math.random() * 10
}));

```
return this.aiops.calculateMovingAverage(data);
```

}

async getServiceCostData() {
return [
{ service: ‘EC2-Instance’, cost: 450.23 },
{ service: ‘S3’, cost: 123.45 },
{ service: ‘RDS’, cost: 234.56 },
{ service: ‘Lambda’, cost: 45.67 },
{ service: ‘CloudFront’, cost: 67.89 },
{ service: ‘ElastiCache’, cost: 89.12 },
{ service: ‘ELB’, cost: 34.56 }
];
}

async getCostAnomalies() {
return [
{
id: ‘1’,
message: ‘EC2コストが予算の80%に到達’,
severity: ‘warning’,
timestamp: new Date().toLocaleString(‘ja-JP’),
impact: 75.5
},
{
id: ‘2’,
message: ‘S3使用量が急増’,
severity: ‘caution’,
timestamp: new Date(Date.now() - 3600000).toLocaleString(‘ja-JP’),
impact: 25.3
}
];
}
}

const getAlertColor = (severity) => {
switch (severity) {
case ‘critical’: return ‘bg-red-200 border-red-600 text-red-800’;
case ‘high’: return ‘bg-red-100 border-red-500 text-red-700’;
case ‘warning’:
case ‘medium’: return ‘bg-yellow-100 border-yellow-500 text-yellow-700’;
case ‘caution’:
case ‘low’: return ‘bg-blue-100 border-blue-500 text-blue-700’;
case ‘normal’:
default: return ‘bg-green-100 border-green-500 text-green-700’;
}
};

const formatCurrency = (value) => {
return new Intl.NumberFormat(‘ja-JP’, {
style: ‘currency’,
currency: ‘USD’,
minimumFractionDigits: 2
}).format(value);
};

// メインダッシュボードコンポーネント
const AIOpsAWSDashboard = () => {
const [data, setData] = useState(null);
const [aiAnalysis, setAiAnalysis] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [refreshInterval, setRefreshInterval] = useState(5);
const [lastUpdated, setLastUpdated] = useState(new Date());
const [activeTab, setActiveTab] = useState(‘overview’);
const [realTimeAnomaly, setRealTimeAnomaly] = useState({ score: 0, level: ‘normal’ });

const costExplorerService = new CostExplorerService();

const loadData = async () => {
try {
setLoading(true);
setError(null);

```
  const [monthlyCost, dailyCost, serviceCost, alerts] = await Promise.all([
    costExplorerService.getMonthlyCostData(),
    costExplorerService.getDailyCostData(),
    costExplorerService.getServiceCostData(),
    costExplorerService.getCostAnomalies()
  ]);

  const aiops = new AIOpsAnalyzer();
  const predictions = aiops.predictCosts(dailyCost, 7);
  const anomalies = aiops.detectAnomalies(dailyCost);
  const seasonality = aiops.analyzeSeasonality(dailyCost);
  const efficiency = aiops.analyzeCostEfficiency(serviceCost);

  const currentCost = dailyCost.length > 0 ? dailyCost[dailyCost.length - 1].total : 0;
  const anomalyScore = aiops.calculateRealTimeAnomalyScore(currentCost, dailyCost);

  setData({ monthlyCost, dailyCost, serviceCost, alerts });
  setAiAnalysis({ predictions, anomalies, seasonality, efficiency });
  setRealTimeAnomaly(anomalyScore);
  setLastUpdated(new Date());
} catch (err) {
  console.error('Data loading error:', err);
  setError('デモモードで動作中');
} finally {
  setLoading(false);
}
```

};

useEffect(() => {
loadData();

```
const intervalId = setInterval(() => {
  loadData();
}, refreshInterval * 60 * 1000);

return () => clearInterval(intervalId);
```

}, [refreshInterval]);

if (loading && !data) {
return (
<div className="flex h-screen items-center justify-center">
<div className="text-center">
<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
<p className="mt-2">AIOps分析エンジンでデータを処理中…</p>
</div>
</div>
);
}

if (!data) {
return (
<div className="flex h-screen items-center justify-center">
<div className="text-center text-red-600">
<p>データの取得に失敗しました</p>
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

const currentMonthCost = data.monthlyCost.length > 0 ? data.monthlyCost[data.monthlyCost.length - 1].total : 0;
const prevMonthCost = data.monthlyCost.length > 1 ? data.monthlyCost[data.monthlyCost.length - 2].total : currentMonthCost;
const monthlyDiff = currentMonthCost - prevMonthCost;
const monthlyDiffPercent = prevMonthCost > 0 ? ((monthlyDiff / prevMonthCost) * 100).toFixed(1) : ‘0.0’;

const latestDailyCost = data.dailyCost.length > 0 ? data.dailyCost[data.dailyCost.length - 1].total : 0;
const prevDailyCost = data.dailyCost.length > 1 ? data.dailyCost[data.dailyCost.length - 2].total : latestDailyCost;
const dailyDiff = latestDailyCost - prevDailyCost;
const dailyDiffPercent = prevDailyCost > 0 ? ((dailyDiff / prevDailyCost) * 100).toFixed(1) : ‘0.0’;

return (
<div className="p-4 max-w-full bg-gray-50 min-h-screen">
{/* ヘッダー */}
<div className="flex justify-between items-center mb-6">
<div>
<h1 className="text-2xl font-bold text-gray-800">AIOps対応 AWS Cost Analytics</h1>
<div className="flex items-center mt-2 space-x-4">
<span className="text-sm text-gray-500">最終更新: {lastUpdated.toLocaleString()}</span>
<div className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertColor(realTimeAnomaly.level)}`}>
異常スコア: {realTimeAnomaly.score} ({realTimeAnomaly.level})
</div>
</div>
</div>
<div className="flex items-center space-x-4">
{error && (
<span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
🚀 デモモード
</span>
)}
<div className="flex items-center">
<label htmlFor="refresh" className="mr-2 text-sm">更新間隔:</label>
<select
id=“refresh”
value={refreshInterval}
onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
className=“border rounded p-1 text-sm”
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
{loading ? ‘AI分析中…’ : ‘今すぐ更新’}
</button>
</div>
</div>

```
  {/* タブナビゲーション */}
  <div className="flex space-x-1 mb-6 bg-gray-200 p-1 rounded-lg">
    {[
      { id: 'overview', name: '概要' },
      { id: 'predictions', name: 'AI予測' },
      { id: 'anomalies', name: '異常検知' },
      { id: 'efficiency', name: '効率分析' }
    ].map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === tab.id 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        {tab.name}
      </button>
    ))}
  </div>
  
  {/* 概要タブ */}
  {activeTab === 'overview' && (
    <>
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
          <h3 className="text-sm font-medium text-gray-500">AI予測アラート</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {aiAnalysis?.anomalies?.length || 0}
            </div>
            <div className="ml-2 text-sm font-medium text-orange-600">
              件検出
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">過去60日分析</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">コスト効率スコア</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {aiAnalysis?.efficiency ? 
                (aiAnalysis.efficiency.reduce((acc, s) => acc + s.efficiency, 0) / aiAnalysis.efficiency.length * 100).toFixed(0) + '%'
                : '85%'
              }
            </div>
            <div className="ml-2 text-sm font-medium text-green-600">
              良好
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">AI分析結果</div>
        </div>
      </div>

      {/* メインダッシュボード */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 日次トレンドグラフ */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">日次コスト推移 & 移動平均 (AIOps)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyCost} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total" name="実際のコスト" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="movingAvg" name="移動平均(7日)" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* リアルタイムアラート */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">リアルタイムアラート</h3>
            <div className="text-xs text-gray-500">AI検知</div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.alerts.length > 0 ? data.alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`border-l-4 p-3 rounded-r ${getAlertColor(alert.severity)}`}
              >
                <div className="font-medium">{alert.message}</div>
                <div className="text-xs mt-1">{alert.timestamp}</div>
                <div className="text-xs mt-1">影響額: {formatCurrency(alert.impact)}</div>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4">
                現在、異常は検出されていません ✅
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 月次トレンドとサービス別コスト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">月次コスト推移</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyCost} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="prod" name="本番環境" fill="#f44336" />
                <Bar dataKey="dev" name="開発環境" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">サービス別コスト分析</h3>
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
    </>
  )}

  {/* AI予測タブ */}
  {activeTab === 'predictions' && aiAnalysis && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">7日間コスト予測</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiAnalysis.predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="upper" stackId="1" stroke="#8884d8" fill="rgba(136, 132, 216, 0.2)" name="上限予測" />
              <Area type="monotone" dataKey="predicted" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="予測値" />
              <Area type="monotone" dataKey="lower" stackId="1" stroke="#ffc658" fill="rgba(255, 198, 88, 0.2)" name="下限予測" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">季節性パターン分析</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiAnalysis.seasonality.weekly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="average" name="平均コスト" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )}

  {/* 異常検知タブ */}
  {activeTab === 'anomalies' && aiAnalysis && (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">検出された異常値 (Z-score > 2.5)</h3>
        {aiAnalysis.anomalies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAnalysis.anomalies.map((anomaly, index) => (
              <div key={index} className={`border-l-4 p-4 rounded-r ${getAlertColor(anomaly.severity)}`}>
                <div className="font-medium">異常検知 #{anomaly.index + 1}</div>
                <div className="text-sm mt-1">日付: {anomaly.date}</div>
                <div className="text-sm mt-1">コスト: {formatCurrency(anomaly.total)}</div>
                <div className="text-sm mt-1">Z-score: {anomaly.zScore.toFixed(2)}</div>
                <div className="text-sm mt-1">重要度: {anomaly.severity}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            異常は検出されませんでした ✅
          </div>
        )}
      </div>
    </div>
  )}

  {/* 効率分析タブ */}
  {activeTab === 'efficiency' && aiAnalysis && (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">コスト効率性分析 & 推奨事項</h3>
        <div className="space-y-4">
          {aiAnalysis.efficiency.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{item.service}</div>
                <div className="text-sm text-gray-500">{formatCurrency(item.cost)}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${
                    item.efficiency > 0.7 ? 'bg-green-500' : 
                    item.efficiency > 0
```