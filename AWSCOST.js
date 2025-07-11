import React, { useState, useEffect, useCallback } from ‘react’;
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Area, AreaChart } from ‘recharts’;

// AWS Cost Explorer APIを使用したコストモニタリングダッシュボード（AIOps対応）
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
const monthlyPattern = Array(31).fill(0);
const counts = { weekly: Array(7).fill(0), monthly: Array(31).fill(0) };

```
data.forEach((item, index) => {
  const dayOfWeek = index % 7;
  const dayOfMonth = (index % 31);
  
  weeklyPattern[dayOfWeek] += item.total;
  monthlyPattern[dayOfMonth] += item.total;
  counts.weekly[dayOfWeek]++;
  counts.monthly[dayOfMonth]++;
});

return {
  weekly: weeklyPattern.map((sum, i) => ({
    day: ['日', '月', '火', '水', '木', '金', '土'][i],
    average: counts.weekly[i] > 0 ? sum / counts.weekly[i] : 0
  })),
  monthly: monthlyPattern.map((sum, i) => ({
    day: i + 1,
    average: counts.monthly[i] > 0 ? sum / counts.monthly[i] : 0
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
    confidence: this.calculateConfidence(data, slope, intercept, futureX)
  });
}

return predictions;
```

}

// 信頼区間の計算
calculateConfidence(data, slope, intercept, x) {
const predictions = data.map((_, i) => slope * i + intercept);
const residuals = data.map((d, i) => d.total - predictions[i]);
const mse = residuals.reduce((acc, r) => acc + r * r, 0) / data.length;
const standardError = Math.sqrt(mse);

```
return {
  upper: slope * x + intercept + 1.96 * standardError,
  lower: Math.max(0, slope * x + intercept - 1.96 * standardError)
};
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
    severity: zScore > 3 ? 'high' : zScore > 2 ? 'medium' : 'low'
  };
}).filter(item => item.isAnomaly);
```

}

// コスト効率性分析
analyzeCostEfficiency(serviceCosts, utilizationData = []) {
return serviceCosts.map(service => {
const utilization = utilizationData.find(u => u.service === service.service);
const efficiency = utilization ? (utilization.usage / 100) * (service.cost / 100) : 0.5;

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

class CostExplorerService {
constructor() {
this.region = process.env.REACT_APP_AWS_REGION || ‘us-east-1’;
this.apiEndpoint = `https://ce.${this.region}.amazonaws.com`;
this.aiops = new AIOpsAnalyzer();
}

async callCostExplorerAPI(operation, params) {
try {
const response = await fetch(’/api/cost-explorer/’ + operation, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘Authorization’: `Bearer ${process.env.REACT_APP_API_TOKEN}`
},
body: JSON.stringify(params)
});

```
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return await response.json();
} catch (error) {
  console.error(`Error calling Cost Explorer API (${operation}):`, error);
  throw error;
}
```

}

async getMonthlyCostData() {
const endDate = new Date();
const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);

```
const params = {
  TimePeriod: {
    Start: startDate.toISOString().split('T')[0],
    End: endDate.toISOString().split('T')[0]
  },
  Granularity: 'MONTHLY',
  Metrics: ['BlendedCost'],
  GroupBy: [{ Type: 'TAG', Key: 'Environment' }]
};

const response = await this.callCostExplorerAPI('GetCostAndUsage', params);
return this.transformMonthlyCostData(response);
```

}

async getDailyCostData() {
const endDate = new Date();
const startDate = new Date(endDate);
startDate.setDate(startDate.getDate() - 60); // より長期間のデータで精度向上

```
const params = {
  TimePeriod: {
    Start: startDate.toISOString().split('T')[0],
    End: endDate.toISOString().split('T')[0]
  },
  Granularity: 'DAILY',
  Metrics: ['BlendedCost'],
  GroupBy: [{ Type: 'TAG', Key: 'Environment' }]
};

const response = await this.callCostExplorerAPI('GetCostAndUsage', params);
return this.transformDailyCostData(response);
```

}

async getServiceCostData() {
const endDate = new Date();
const startDate = new Date(endDate);
startDate.setDate(startDate.getDate() - 30);

```
const params = {
  TimePeriod: {
    Start: startDate.toISOString().split('T')[0],
    End: endDate.toISOString().split('T')[0]
  },
  Granularity: 'MONTHLY',
  Metrics: ['BlendedCost'],
  GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
};

const response = await this.callCostExplorerAPI('GetCostAndUsage', params);
return this.transformServiceCostData(response);
```

}

async getCostAnomalies() {
const params = {
DateInterval: {
StartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split(‘T’)[0],
EndDate: new Date().toISOString().split(‘T’)[0]
},
MaxResults: 10
};

```
try {
  const response = await this.callCostExplorerAPI('GetAnomalies', params);
  return this.transformAnomalyData(response);
} catch (error) {
  console.warn('Cost anomaly detection not available or configured:', error);
  return [];
}
```

}

transformMonthlyCostData(response) {
return response.ResultsByTime?.map(result => {
const date = result.TimePeriod.Start;
let total = 0;
let prod = 0;
let dev = 0;

```
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
```

}

transformDailyCostData(response) {
const transformed = response.ResultsByTime?.map(result => {
const date = result.TimePeriod.Start;
let total = 0;
let prod = 0;
let dev = 0;

```
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
    dev: dev,
    timestamp: new Date(date)
  };
}) || [];

// AIOps分析を追加
const withMovingAvg = this.aiops.calculateMovingAverage(transformed);
return withMovingAvg;
```

}

transformServiceCostData(response) {
const serviceCosts = [];

```
response.ResultsByTime?.[0]?.Groups?.forEach(group => {
  const serviceName = group.Keys[0];
  const cost = parseFloat(group.Metrics.BlendedCost.Amount);
  
  if (cost > 0.01) {
    serviceCosts.push({
      service: serviceName.length > 15 ? serviceName.substring(0, 15) + '...' : serviceName,
      cost: cost
    });
  }
});

return serviceCosts.sort((a, b) => b.cost - a.cost).slice(0, 15);
```

}

transformAnomalyData(response) {
return response.Anomalies?.map(anomaly => ({
id: anomaly.AnomalyId,
message: `${anomaly.RootCauses?.[0]?.Service || 'Unknown'}: $${anomaly.Impact.TotalImpact.toFixed(2)}の異常増加`,
severity: anomaly.Impact.TotalImpact > 100 ? ‘high’ : anomaly.Impact.TotalImpact > 50 ? ‘medium’ : ‘low’,
timestamp: new Date(anomaly.AnomalyStartDate).toLocaleString(‘ja-JP’),
impact: anomaly.Impact.TotalImpact
})) || [];
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

// AIOps強化メインダッシュボードコンポーネント
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

  // AIOps分析の実行
  const aiops = new AIOpsAnalyzer();
  const predictions = aiops.predictCosts(dailyCost, 7);
  const anomalies = aiops.detectAnomalies(dailyCost);
  const seasonality = aiops.analyzeSeasonality(dailyCost);
  const efficiency = aiops.analyzeCostEfficiency(serviceCost);

  // リアルタイム異常スコアの計算
  const currentCost = dailyCost.length > 0 ? dailyCost[dailyCost.length - 1].total : 0;
  const anomalyScore = aiops.calculateRealTimeAnomalyScore(currentCost, dailyCost);

  setData({ monthlyCost, dailyCost, serviceCost, alerts });
  setAiAnalysis({ predictions, anomalies, seasonality, efficiency });
  setRealTimeAnomaly(anomalyScore);
  setLastUpdated(new Date());
} catch (err) {
  console.error('Data loading error:', err);
  setError('AWS Cost Explorer APIからのデータ取得に失敗しました: ' + (err.message || '不明なエラー'));
  
  if (!data) {
    setData(generateFallbackData());
    generateFallbackAIAnalysis();
  }
} finally {
  setLoading(false);
}
```

};

const generateFallbackData = () => {
const months = [‘1月’, ‘2月’, ‘3月’, ‘4月’, ‘5月’, ‘6月’];
const monthlyCost = months.map((month, index) => ({
date: month,
total: 1000 + Math.random() * 500,
prod: 700 + Math.random() * 300,
dev: 300 + Math.random() * 200
}));

```
const dailyCost = Array.from({ length: 60 }, (_, index) => ({
  date: `${index + 1}`,
  total: 30 + Math.random() * 20 + Math.sin(index / 7) * 10,
  prod: 20 + Math.random() * 15,
  dev: 10 + Math.random() * 10,
  movingAvg: 35 + Math.sin(index / 7) * 8
}));

const serviceCost = [
  { service: 'EC2-Instance', cost: 450.23 },
  { service: 'S3', cost: 123.45 },
  { service: 'RDS', cost: 234.56 },
  { service: 'Lambda', cost: 45.67 },
  { service: 'CloudFront', cost: 67.89 },
  { service: 'ElastiCache', cost: 89.12 },
  { service: 'ELB', cost: 34.56 }
];

const alerts = [
  {
    id: '1',
    message: 'EC2コストが予算の80%に到達',
    severity: 'warning',
    timestamp: new Date().toLocaleString('ja-JP')
  },
  {
    id: '2',
    message: 'S3使用量が急増',
    severity: 'caution',
    timestamp: new Date(Date.now() - 3600000).toLocaleString('ja-JP')
  }
];

return { monthlyCost, dailyCost, serviceCost, alerts };
```

};

const generateFallbackAIAnalysis = () => {
const aiops = new AIOpsAnalyzer();
const fallbackData = generateFallbackData();

```
const predictions = aiops.predictCosts(fallbackData.dailyCost, 7);
const anomalies = aiops.detectAnomalies(fallbackData.dailyCost);
const seasonality = aiops.analyzeSeasonality(fallbackData.dailyCost);
const efficiency = aiops.analyzeCostEfficiency(fallbackData.serviceCost);

setAiAnalysis({ predictions, anomalies, seasonality, efficiency });
setRealTimeAnomaly({ score: '1.2', level: 'normal' });
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

const handleRefreshIntervalChange = (e) => {
setRefreshInterval(parseInt(e.target.value));
};

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
⚠️ デモモード
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

      {/* グラフとアラートのセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">