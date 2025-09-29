import React, { useState, useMemo } from ‘react’;
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from ‘recharts’;
import { Calendar, CreditCard, TrendingUp, Award, Filter, Plus, Target } from ‘lucide-react’;

// モックデータ生成
const generateMockData = () => {
const categories = [‘GROCERY’, ‘DINING’, ‘TRANSPORT’, ‘SHOPPING’, ‘ENTERTAINMENT’, ‘UTILITIES’];
const cards = [
{ id: ‘card001’, name: ‘プラチナカード’, rate: 0.01 },
{ id: ‘card002’, name: ‘ゴールドカード’, rate: 0.015 },
{ id: ‘card003’, name: ‘トラベルカード’, rate: 0.02 },
];
const merchants = [‘スーパーA’, ‘レストランB’, ‘駅C’, ‘ショップD’, ‘映画館E’, ‘電力会社F’];

const data = [];
const startDate = new Date(‘2025-06-01’);

for (let i = 0; i < 150; i++) {
const date = new Date(startDate);
date.setDate(date.getDate() + Math.floor(i / 3));
const card = cards[Math.floor(Math.random() * cards.length)];
const category = categories[Math.floor(Math.random() * categories.length)];
const amount = Math.floor(Math.random() * 10000) + 500;

```
data.push({
  userId: 'user123',
  transactionId: `txn${String(i).padStart(3, '0')}`,
  transactionDate: date.toISOString().split('T')[0],
  cardId: card.id,
  cardName: card.name,
  merchantName: merchants[Math.floor(Math.random() * merchants.length)],
  category,
  transactionAmount: amount,
  kickbackAmount: Math.floor(amount * card.rate),
  kickbackType: 'POINT',
  kickbackRate: card.rate,
});
```

}

return data.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
};

const COLORS = [’#8b5cf6’, ‘#ec4899’, ‘#f59e0b’, ‘#10b981’, ‘#3b82f6’, ‘#ef4444’];
const CATEGORY_LABELS = {
GROCERY: ‘食料品’,
DINING: ‘飲食’,
TRANSPORT: ‘交通’,
SHOPPING: ‘ショッピング’,
ENTERTAINMENT: ‘エンタメ’,
UTILITIES: ‘公共料金’
};

function App() {
const [transactions] = useState(generateMockData());
const [selectedPeriod, setSelectedPeriod] = useState(‘all’);
const [selectedCard, setSelectedCard] = useState(‘all’);
const [selectedCategory, setSelectedCategory] = useState(‘all’);
const [showAddModal, setShowAddModal] = useState(false);

// フィルタリング
const filteredTransactions = useMemo(() => {
let filtered = transactions;

```
if (selectedPeriod !== 'all') {
  const now = new Date();
  const periodStart = new Date();
  if (selectedPeriod === '30days') {
    periodStart.setDate(now.getDate() - 30);
  } else if (selectedPeriod === 'thisMonth') {
    periodStart.setDate(1);
  } else if (selectedPeriod === 'lastMonth') {
    periodStart.setMonth(now.getMonth() - 1);
    periodStart.setDate(1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    filtered = filtered.filter(t => {
      const tDate = new Date(t.transactionDate);
      return tDate >= periodStart && tDate <= periodEnd;
    });
    return filtered;
  }
  filtered = filtered.filter(t => new Date(t.transactionDate) >= periodStart);
}

if (selectedCard !== 'all') {
  filtered = filtered.filter(t => t.cardId === selectedCard);
}

if (selectedCategory !== 'all') {
  filtered = filtered.filter(t => t.category === selectedCategory);
}

return filtered;
```

}, [transactions, selectedPeriod, selectedCard, selectedCategory]);

// 統計計算
const stats = useMemo(() => {
const totalKickback = filteredTransactions.reduce((sum, t) => sum + t.kickbackAmount, 0);
const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.transactionAmount, 0);
const avgRate = totalSpent > 0 ? (totalKickback / totalSpent) : 0;

```
return {
  totalKickback,
  totalSpent,
  avgRate,
  transactionCount: filteredTransactions.length
};
```

}, [filteredTransactions]);

// カテゴリ別集計
const categoryData = useMemo(() => {
const grouped = {};
filteredTransactions.forEach(t => {
if (!grouped[t.category]) {
grouped[t.category] = { category: t.category, amount: 0, kickback: 0, count: 0 };
}
grouped[t.category].amount += t.transactionAmount;
grouped[t.category].kickback += t.kickbackAmount;
grouped[t.category].count += 1;
});
return Object.values(grouped).sort((a, b) => b.kickback - a.kickback);
}, [filteredTransactions]);

// カード別集計
const cardData = useMemo(() => {
const grouped = {};
filteredTransactions.forEach(t => {
if (!grouped[t.cardId]) {
grouped[t.cardId] = {
cardName: t.cardName,
amount: 0,
kickback: 0,
count: 0,
avgRate: 0
};
}
grouped[t.cardId].amount += t.transactionAmount;
grouped[t.cardId].kickback += t.kickbackAmount;
grouped[t.cardId].count += 1;
});

```
Object.values(grouped).forEach(card => {
  card.avgRate = card.amount > 0 ? (card.kickback / card.amount) : 0;
  card.efficiency = (card.kickback * 0.4 + card.count * 0.3 + card.avgRate * 1000 * 0.3);
});

return Object.values(grouped).sort((a, b) => b.efficiency - a.efficiency);
```

}, [filteredTransactions]);

// 日別推移
const dailyTrend = useMemo(() => {
const grouped = {};
filteredTransactions.forEach(t => {
if (!grouped[t.transactionDate]) {
grouped[t.transactionDate] = { date: t.transactionDate, kickback: 0, spent: 0 };
}
grouped[t.transactionDate].kickback += t.kickbackAmount;
grouped[t.transactionDate].spent += t.transactionAmount;
});
return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
}, [filteredTransactions]);

// カード一覧
const cards = […new Set(transactions.map(t => ({ id: t.cardId, name: t.cardName })))];
const categories = […new Set(transactions.map(t => t.category))];

return (
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
{/* ヘッダー */}
<header className="bg-white shadow-md">
<div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between">
<div className="flex items-center space-x-3">
<Award className="w-8 h-8 text-yellow-500" />
<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
🏅 オリンピック版キックバック管理
</h1>
</div>
<button
onClick={() => setShowAddModal(true)}
className=“flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all”
>
<Plus className="w-5 h-5" />
<span>新規取引</span>
</button>
</div>
</div>
</header>

```
  <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    {/* フィルター */}
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">フィルター</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">全期間</option>
            <option value="30days">過去30日</option>
            <option value="thisMonth">今月</option>
            <option value="lastMonth">先月</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">カード</label>
          <select 
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* 統計カード */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <Award className="w-8 h-8 opacity-80" />
          <span className="text-3xl">🥇</span>
        </div>
        <p className="text-sm opacity-90 mb-1">総キックバック</p>
        <p className="text-3xl font-bold">{stats.totalKickback.toLocaleString()}pt</p>
      </div>
      
      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <CreditCard className="w-8 h-8 opacity-80" />
          <span className="text-3xl">🥈</span>
        </div>
        <p className="text-sm opacity-90 mb-1">総支出額</p>
        <p className="text-3xl font-bold">¥{stats.totalSpent.toLocaleString()}</p>
      </div>
      
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-8 h-8 opacity-80" />
          <span className="text-3xl">🥉</span>
        </div>
        <p className="text-sm opacity-90 mb-1">平均還元率</p>
        <p className="text-3xl font-bold">{(stats.avgRate * 100).toFixed(2)}%</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <Calendar className="w-8 h-8 opacity-80" />
          <span className="text-3xl">🏅</span>
        </div>
        <p className="text-sm opacity-90 mb-1">取引件数</p>
        <p className="text-3xl font-bold">{stats.transactionCount}</p>
      </div>
    </div>

    {/* グラフエリア */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* 日別推移 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">日別キックバック推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="kickback" stroke="#8b5cf6" strokeWidth={2} name="キックバック" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* カテゴリ別分布 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">カテゴリ別分布</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percent }) => `${CATEGORY_LABELS[category]} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="kickback"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* ランキングエリア */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* カテゴリ別ランキング */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">カテゴリ別表彰台 🏆</h3>
        </div>
        <div className="space-y-3">
          {categoryData.slice(0, 5).map((item, idx) => (
            <div key={item.category} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{CATEGORY_LABELS[item.category]}</p>
                  <p className="text-sm text-gray-600">{item.count}件の取引</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">{item.kickback.toLocaleString()}pt</p>
                <p className="text-sm text-gray-600">¥{item.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* カード効率ランキング */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">カード効率スコア 🎯</h3>
        </div>
        <div className="space-y-3">
          {cardData.map((item, idx) => (
            <div key={item.cardName} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                  <p className="font-semibold text-gray-800">{item.cardName}</p>
                </div>
                <p className="text-lg font-bold text-blue-600">{item.efficiency.toFixed(0)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">キックバック</p>
                  <p className="font-semibold">{item.kickback.toLocaleString()}pt</p>
                </div>
                <div>
                  <p className="text-gray-600">利用回数</p>
                  <p className="font-semibold">{item.count}回</p>
                </div>
                <div>
                  <p className="text-gray-600">平均還元率</p>
                  <p className="font-semibold">{(item.avgRate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* 最近の取引 */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">最近の取引履歴</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">カテゴリ</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">店舗</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">カード</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">金額</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">キックバック</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.slice(0, 10).map((t) => (
              <tr key={t.transactionId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{t.transactionDate}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    {CATEGORY_LABELS[t.category]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{t.merchantName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{t.cardName}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">¥{t.transactionAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">
                  {t.kickbackAmount.toLocaleString()}pt
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </main>

  {/* 新規取引モーダル（簡易版） */}
  {showAddModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">新規取引追加</h3>
        <p className="text-gray-600 mb-4">
          実際のアプリでは、ここから新しい取引を追加できます。
          現在はデモモードのため、モックデータを表示しています。
        </p>
        <button 
          onClick={() => setShowAddModal(false)}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          閉じる
        </button>
      </div>
    </div>
  )}
</div>
```

);
}

export default App;