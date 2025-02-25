// テクニカル指標を計算するユーティリティ関数

// 単純移動平均線 (Simple Moving Average)
const calculateSMA = (data, period, key = 'close') => {
  const result = [...data];
  
  for (let i = 0; i < result.length; i++) {
    if (i < period - 1) {
      result[i][`sma${period}`] = null;
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += result[i - j][key];
    }
    
    result[i][`sma${period}`] = sum / period;
  }
  
  return result;
};

// 指数移動平均線 (Exponential Moving Average)
const calculateEMA = (data, period, key = 'close') => {
  const result = [...data];
  const multiplier = 2 / (period + 1);
  
  // 最初のEMAは単純平均として計算
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += result[i][key];
  }
  
  result[period - 1][`ema${period}`] = sum / period;
  
  // 残りのEMAを計算
  for (let i = period; i < result.length; i++) {
    result[i][`ema${period}`] = 
      (result[i][key] - result[i - 1][`ema${period}`]) * multiplier + 
      result[i - 1][`ema${period}`];
  }
  
  // 期間未満のデータにはnullを設定
  for (let i = 0; i < period - 1; i++) {
    result[i][`ema${period}`] = null;
  }
  
  return result;
};

// RSI (Relative Strength Index)
const calculateRSI = (data, period = 14) => {
  const result = [...data];
  
  // 価格変化を計算
  for (let i = 1; i < result.length; i++) {
    result[i].change = result[i].close - result[i - 1].close;
  }
  
  // 初期値
  result[0].change = 0;
  
  for (let i = 0; i < result.length; i++) {
    if (i < period) {
      result[i].rsi = null;
      continue;
    }
    
    let gainSum = 0;
    let lossSum = 0;
    
    // 過去period期間の値上がり/値下がりの合計
    for (let j = 0; j < period; j++) {
      const change = result[i - j].change;
      if (change > 0) {
        gainSum += change;
      } else {
        lossSum -= change;
      }
    }
    
    // 平均値上がり/値下がり
    const avgGain = gainSum / period;
    const avgLoss = lossSum / period;
    
    // 相対力指数
    if (avgLoss === 0) {
      result[i].rsi = 100;
    } else {
      const RS = avgGain / avgLoss;
      result[i].rsi = 100 - (100 / (1 + RS));
    }
  }
  
  return result;
};

// MACD (Moving Average Convergence Divergence)
const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  // EMAsを計算
  let result = calculateEMA(data, fastPeriod);
  result = calculateEMA(result, slowPeriod);
  
  // MACDラインを計算
  for (let i = 0; i < result.length; i++) {
    if (i < slowPeriod - 1) {
      result[i].macd = null;
    } else {
      result[i].macd = (result[i][`ema${fastPeriod}`] || 0) - (result[i][`ema${slowPeriod}`] || 0);
    }
  }
  
  // シグナルラインの最初の値を計算（MACDの単純平均）
  let macdSum = 0;
  let validPoints = 0;
  
  for (let i = slowPeriod - 1; i < slowPeriod - 1 + signalPeriod; i++) {
    if (result[i] && result[i].macd !== null) {
      macdSum += result[i].macd;
      validPoints++;
    }
  }
  
  if (validPoints > 0) {
    result[slowPeriod - 1 + signalPeriod - 1].signal = macdSum / validPoints;
  }
  
  // 残りのシグナルラインを計算（MACDのEMA）
  const multiplier = 2 / (signalPeriod + 1);
  
  for (let i = slowPeriod - 1 + signalPeriod; i < result.length; i++) {
    result[i].signal = 
      (result[i].macd - result[i - 1].signal) * multiplier + 
      result[i - 1].signal;
  }
  
  // シグナルが計算されていない箇所にはnullを設定
  for (let i = 0; i < slowPeriod - 1 + signalPeriod - 1; i++) {
    result[i].signal = null;
  }
  
  return result;
};

// ボリンジャーバンド
const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  // SMAを計算
  let result = calculateSMA(data, period);
  
  // 標準偏差を計算
  for (let i = 0; i < result.length; i++) {
    if (i < period - 1) {
      result[i].upperBand = null;
      result[i].lowerBand = null;
      continue;
    }
    
    let sumSquaredDiff = 0;
    
    for (let j = 0; j < period; j++) {
      const diff = result[i - j].close - result[i][`sma${period}`];
      sumSquaredDiff += diff * diff;
    }
    
    const standardDeviation = Math.sqrt(sumSquaredDiff / period);
    
    result[i].upperBand = result[i][`sma${period}`] + (multiplier * standardDeviation);
    result[i].lowerBand = result[i][`sma${period}`] - (multiplier * standardDeviation);
  }
  
  return result;
};

// すべてのテクニカル指標を一度に計算
export const calculateTechnicalIndicators = (data) => {
  let result = [...data];
  
  // 移動平均線
  result = calculateSMA(result, 20);
  result = calculateSMA(result, 50);
  
  // 指数移動平均線
  result = calculateEMA(result, 12);
  result = calculateEMA(result, 26);
  
  // RSI
  result = calculateRSI(result, 14);
  
  // MACD
  result = calculateMACD(result);
  
  // ボリンジャーバンド
  result = calculateBollingerBands(result);
  
  return result;
};

// チャートの種類によってデータを変換
export const convertDataForChart = (data, chartType) => {
  switch (chartType) {
    case 'daily':
      // 日足はそのまま返す
      return data;
    case 'weekly':
      // 週足に変換
      return convertToWeekly(data);
    case 'monthly':
      // 月足に変換
      return convertToMonthly(data);
    default:
      return data;
  }
};

// 日足を週足に変換
const convertToWeekly = (data) => {
  const weeklyData = [];
  let currentWeek = null;
  let weekData = null;
  
  data.forEach(day => {
    const date = new Date(day.date);
    const yearWeek = `${date.getFullYear()}-${Math.floor(date.getDate() / 7)}`;
    
    if (yearWeek !== currentWeek) {
      if (weekData) {
        weeklyData.push(weekData);
      }
      
      currentWeek = yearWeek;
      weekData = {
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      };
    } else {
      weekData.high = Math.max(weekData.high, day.high);
      weekData.low = Math.min(weekData.low, day.low);
      weekData.close = day.close;
      weekData.volume += day.volume;
    }
  });
  
  if (weekData) {
    weeklyData.push(weekData);
  }
  
  return weeklyData;
};

// 日足を月足に変換
const convertToMonthly = (data) => {
  const monthlyData = [];
  let currentMonth = null;
  let monthData = null;
  
  data.forEach(day => {
    const date = new Date(day.date);
    const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (yearMonth !== currentMonth) {
      if (monthData) {
        monthlyData.push(monthData);
      }
      
      currentMonth = yearMonth;
      monthData = {
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      };
    } else {
      monthData.high = Math.max(monthData.high, day.high);
      monthData.low = Math.min(monthData.low, day.low);
      monthData.close = day.close;
      monthData.volume += day.volume;
    }
  });
  
  if (monthData) {
    monthlyData.push(monthData);
  }
  
  return monthlyData;
};
