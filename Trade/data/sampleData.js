// サンプルデータ - 実際のアプリケーションではAPIから取得することになります
export const stockData = [
  { date: '2024-02-01', open: 150.23, high: 153.45, low: 149.87, close: 152.34, volume: 5643210 },
  { date: '2024-02-02', open: 152.34, high: 154.56, low: 151.23, close: 153.45, volume: 4532100 },
  { date: '2024-02-03', open: 153.45, high: 155.67, low: 152.34, close: 154.56, volume: 6721300 },
  { date: '2024-02-04', open: 154.56, high: 156.78, low: 153.45, close: 150.23, volume: 7832100 },
  { date: '2024-02-05', open: 150.23, high: 152.34, low: 148.12, close: 151.23, volume: 6543200 },
  { date: '2024-02-06', open: 151.23, high: 153.45, low: 149.01, close: 152.34, volume: 5432100 },
  { date: '2024-02-07', open: 152.34, high: 154.56, low: 150.23, close: 153.45, volume: 4321000 },
  { date: '2024-02-08', open: 153.45, high: 155.67, low: 151.23, close: 152.34, volume: 5432100 },
  { date: '2024-02-09', open: 152.34, high: 154.56, low: 150.23, close: 151.23, volume: 6543200 },
  { date: '2024-02-10', open: 151.23, high: 153.45, low: 149.01, close: 150.23, volume: 5432100 },
  { date: '2024-02-11', open: 150.23, high: 152.34, low: 148.12, close: 149.01, volume: 4321000 },
  { date: '2024-02-12', open: 149.01, high: 151.23, low: 147.90, close: 151.23, volume: 5432100 },
  { date: '2024-02-13', open: 151.23, high: 153.45, low: 150.23, close: 152.34, volume: 6543200 },
  { date: '2024-02-14', open: 152.34, high: 154.56, low: 151.23, close: 155.67, volume: 7654300 },
  { date: '2024-02-15', open: 155.67, high: 157.89, low: 154.56, close: 156.78, volume: 8765400 },
];

// 株式テーブルに表示する銘柄リスト
export const stockList = [
  { code: '1001', name: 'テクノコープ', price: 1548.50, change: +34.20, changePercent: +2.21, volume: 1234567 },
  { code: '1002', name: 'ネットワーカー', price: 3421.00, change: -56.70, changePercent: -1.63, volume: 2345678 },
  { code: '1003', name: '未来電機', price: 789.30, change: +12.40, changePercent: +1.57, volume: 3456789 },
  { code: '1004', name: 'グリーンエナジー', price: 2345.60, change: -22.30, changePercent: -0.94, volume: 4567890 },
  { code: '1005', name: 'AIテクノロジー', price: 5678.90, change: +123.40, changePercent: +2.17, volume: 5678901 },
  { code: '1006', name: 'ロボティクス', price: 4321.00, change: -87.60, changePercent: -2.03, volume: 6789012 },
  { code: '1007', name: '医療イノベーション', price: 3456.70, change: +45.60, changePercent: +1.32, volume: 7890123 },
  { code: '1008', name: '金融サービス', price: 2109.80, change: -34.50, changePercent: -1.63, volume: 8901234 },
  { code: '1009', name: '建設グループ', price: 1234.50, change: +23.40, changePercent: +1.89, volume: 9012345 },
  { code: '1010', name: '食品メーカー', price: 3210.90, change: -43.20, changePercent: -1.34, volume: 1234567 },
];
