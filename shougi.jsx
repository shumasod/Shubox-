import React, { useState, useEffect, useRef } from ‘react’;
import { Play, Pause, RotateCcw, RefreshCw, Clock, Settings } from ‘lucide-react’;

export default function ShogiTimer() {
const [player1Time, setPlayer1Time] = useState(10 * 60); // 10分
const [player2Time, setPlayer2Time] = useState(10 * 60); // 10分
const [player1ByoyomiTime, setPlayer1ByoyomiTime] = useState(30); // 30秒
const [player2ByoyomiTime, setPlayer2ByoyomiTime] = useState(30); // 30秒
const [activePlayer, setActivePlayer] = useState(1);
const [isRunning, setIsRunning] = useState(false);
const [isInByoyomi, setIsInByoyomi] = useState({ player1: false, player2: false });
const [byoyomiCount, setByoyomiCount] = useState({ player1: 0, player2: 0 });
const [settings, setSettings] = useState({
mainTime: 10, // 分
byoyomiTime: 30, // 秒
byoyomiType: ‘countdown’ // ‘countdown’ or ‘addtime’
});
const [showSettings, setShowSettings] = useState(false);

const intervalRef = useRef(null);
const lastBeepTime = useRef(0);

useEffect(() => {
if (isRunning) {
intervalRef.current = setInterval(() => {
const now = Date.now();

```
    if (activePlayer === 1) {
      if (!isInByoyomi.player1) {
        setPlayer1Time(prev => {
          if (prev <= 1) {
            setIsInByoyomi(prev => ({ ...prev, player1: true }));
            setPlayer1ByoyomiTime(settings.byoyomiTime);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setPlayer1ByoyomiTime(prev => {
          if (prev <= 1) {
            if (settings.byoyomiType === 'countdown') {
              setByoyomiCount(prevCount => ({ ...prevCount, player1: prevCount.player1 + 1 }));
              playBeep();
              return settings.byoyomiTime;
            } else {
              setIsRunning(false);
              playTimeUpSound();
              return 0;
            }
          }
          
          // 秒読み時の音声
          if (prev <= 10 && prev > 1 && now - lastBeepTime.current > 900) {
            playTickSound();
            lastBeepTime.current = now;
          }
          
          return prev - 1;
        });
      }
    } else {
      if (!isInByoyomi.player2) {
        setPlayer2Time(prev => {
          if (prev <= 1) {
            setIsInByoyomi(prev => ({ ...prev, player2: true }));
            setPlayer2ByoyomiTime(settings.byoyomiTime);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setPlayer2ByoyomiTime(prev => {
          if (prev <= 1) {
            if (settings.byoyomiType === 'countdown') {
              setByoyomiCount(prevCount => ({ ...prevCount, player2: prevCount.player2 + 1 }));
              playBeep();
              return settings.byoyomiTime;
            } else {
              setIsRunning(false);
              playTimeUpSound();
              return 0;
            }
          }
          
          // 秒読み時の音声
          if (prev <= 10 && prev > 1 && now - lastBeepTime.current > 900) {
            playTickSound();
            lastBeepTime.current = now;
          }
          
          return prev - 1;
        });
      }
    }
  }, 1000);
} else {
  clearInterval(intervalRef.current);
}

return () => clearInterval(intervalRef.current);
```

}, [isRunning, activePlayer, isInByoyomi, settings]);

const playTickSound = () => {
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

```
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

oscillator.frequency.value = 600;
oscillator.type = 'sine';
gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

oscillator.start();
oscillator.stop(audioContext.currentTime + 0.1);
```

};

const playBeep = () => {
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

```
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

oscillator.frequency.value = 800;
oscillator.type = 'sine';
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

oscillator.start();
oscillator.stop(audioContext.currentTime + 0.3);
```

};

const playTimeUpSound = () => {
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

```
// 3回のビープ音
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }, i * 600);
}
```

};

const formatTime = (seconds) => {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatByoyomiTime = (seconds) => {
return seconds.toString();
};

const toggleTimer = () => {
setIsRunning(!isRunning);
};

const switchPlayer = () => {
if (isRunning) {
setActivePlayer(activePlayer === 1 ? 2 : 1);

```
  // 加算方式の場合、手番を変える時に秒読み時間を戻す
  if (settings.byoyomiType === 'addtime') {
    if (activePlayer === 1 && isInByoyomi.player1) {
      setPlayer1ByoyomiTime(settings.byoyomiTime);
    } else if (activePlayer === 2 && isInByoyomi.player2) {
      setPlayer2ByoyomiTime(settings.byoyomiTime);
    }
  }
}
```

};

const resetTimer = () => {
setIsRunning(false);
setPlayer1Time(settings.mainTime * 60);
setPlayer2Time(settings.mainTime * 60);
setPlayer1ByoyomiTime(settings.byoyomiTime);
setPlayer2ByoyomiTime(settings.byoyomiTime);
setActivePlayer(1);
setIsInByoyomi({ player1: false, player2: false });
setByoyomiCount({ player1: 0, player2: 0 });
};

const applySettings = () => {
resetTimer();
setShowSettings(false);
};

const getTimeColor = (time, isActive = false, inByoyomi = false) => {
if (inByoyomi) {
if (time <= 5) return ‘text-red-600’;
if (time <= 10) return ‘text-orange-500’;
return ‘text-blue-600’;
}
if (time <= 60) return ‘text-red-500’;
if (time <= 300) return ‘text-yellow-500’;
if (isActive) return ‘text-blue-500’;
return ‘text-gray-700’;
};

const presetTimes = [
{ name: ‘3分’, main: 3, byoyomi: 30 },
{ name: ‘5分’, main: 5, byoyomi: 30 },
{ name: ‘10分’, main: 10, byoyomi: 30 },
{ name: ‘15分’, main: 15, byoyomi: 60 },
{ name: ‘30分’, main: 30, byoyomi: 60 },
{ name: ‘60分’, main: 60, byoyomi: 60 }
];

return (
<div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
<div className="bg-white rounded-lg shadow-lg p-6">
<div className="text-center mb-6">
<h1 className="text-3xl font-bold text-gray-800 mb-4">将棋タイマー</h1>
<div className="flex justify-center gap-4">
<button
onClick={() => setShowSettings(!showSettings)}
className=“px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 flex items-center gap-2 transition-colors”
>
<Settings className="w-4 h-4" />
設定
</button>
</div>
</div>

```
    {showSettings && (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">タイマー設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">持ち時間（分）</label>
            <input
              type="number"
              value={settings.mainTime}
              onChange={(e) => setSettings(prev => ({ ...prev, mainTime: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="180"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">秒読み時間（秒）</label>
            <input
              type="number"
              value={settings.byoyomiTime}
              onChange={(e) => setSettings(prev => ({ ...prev, byoyomiTime: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="10"
              max="120"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">秒読み方式</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="countdown"
                checked={settings.byoyomiType === 'countdown'}
                onChange={(e) => setSettings(prev => ({ ...prev, byoyomiType: e.target.value }))}
                className="mr-2"
              />
              カウントダウン方式
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="addtime"
                checked={settings.byoyomiType === 'addtime'}
                onChange={(e) => setSettings(prev => ({ ...prev, byoyomiType: e.target.value }))}
                className="mr-2"
              />
              加算方式
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">プリセット</label>
          <div className="flex flex-wrap gap-2">
            {presetTimes.map((preset, index) => (
              <button
                key={index}
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  mainTime: preset.main, 
                  byoyomiTime: preset.byoyomi 
                }))}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={applySettings}
          className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
        >
          設定を適用
        </button>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* プレイヤー1 */}
      <div className={`text-center p-6 rounded-lg border-2 transition-all ${
        activePlayer === 1 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="text-xl font-bold text-gray-800 mb-2">先手</div>
        <div className={`text-5xl font-mono font-bold mb-2 ${getTimeColor(player1Time, activePlayer === 1, isInByoyomi.player1)}`}>
          {isInByoyomi.player1 ? formatByoyomiTime(player1ByoyomiTime) : formatTime(player1Time)}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          {isInByoyomi.player1 ? '秒読み' : '持ち時間'}
        </div>
        {isInByoyomi.player1 && settings.byoyomiType === 'countdown' && (
          <div className="text-sm text-red-600">
            秒読み回数: {byoyomiCount.player1}
          </div>
        )}
        {activePlayer === 1 && isRunning && (
          <div className="mt-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* プレイヤー2 */}
      <div className={`text-center p-6 rounded-lg border-2 transition-all ${
        activePlayer === 2 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="text-xl font-bold text-gray-800 mb-2">後手</div>
        <div className={`text-5xl font-mono font-bold mb-2 ${getTimeColor(player2Time, activePlayer === 2, isInByoyomi.player2)}`}>
          {isInByoyomi.player2 ? formatByoyomiTime(player2ByoyomiTime) : formatTime(player2Time)}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          {isInByoyomi.player2 ? '秒読み' : '持ち時間'}
        </div>
        {isInByoyomi.player2 && settings.byoyomiType === 'countdown' && (
          <div className="text-sm text-red-600">
            秒読み回数: {byoyomiCount.player2}
          </div>
        )}
        {activePlayer === 2 && isRunning && (
          <div className="mt-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    </div>

    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={toggleTimer}
        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
          isRunning
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isRunning ? '一時停止' : '開始'}
      </button>
      
      <button
        onClick={switchPlayer}
        disabled={!isRunning}
        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
          isRunning
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <RefreshCw className="w-5 h-5" />
        手番交代
      </button>
      
      <button
        onClick={resetTimer}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 flex items-center gap-2 transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
        リセット
      </button>
    </div>
    
    <div className="text-center text-sm text-gray-600">
      <p className="mb-2">現在の設定: 持ち時間{settings.mainTime}分 + 秒読み{settings.byoyomiTime}秒（{settings.byoyomiType === 'countdown' ? 'カウントダウン方式' : '加算方式'}）</p>
      <p>
        <span className="text-yellow-500">■</span> 5分以下　
        <span className="text-red-500">■</span> 1分以下　
        <span className="text-blue-600">■</span> 秒読み中
      </p>
      <p className="mt-1 text-xs">
        秒読み10秒以下でカウント音、0秒でベル音が鳴ります
      </p>
    </div>
  </div>
</div>
```

);
}