import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, AlertTriangle, User, LogOut, Download, FileText, TrendingUp, Award } from 'lucide-react';

// Web Crypto API を使用した暗号化関数
const encryptData = async (data, key) => {
  try {
    const encoder = new TextEncoder();
    const keyBuffer = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      keyBuffer,
      encodedData
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
};

const decryptData = async (encryptedData, key) => {
  try {
    const decoder = new TextDecoder();
    const keyBuffer = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      keyBuffer,
      encrypted
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// パスワードハッシュ化
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const HachikoCyberSecurityGame = () => {
  // 認証状態
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [userPermissionLevel, setUserPermissionLevel] = useState(0);
  const [sessionToken, setSessionToken] = useState('');
  const [sessionExpiry, setSessionExpiry] = useState(null);

  // ゲーム状態
  const [securityLevel, setSecurityLevel] = useState(50);
  const [score, setScore] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  // UI状態
  const [statusText, setStatusText] = useState('ログインしてゲームを開始してください');
  const [loginError, setLoginError] = useState('');
  const [gameOverVisible, setGameOverVisible] = useState(false);
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);

  // フォーム入力
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ゲームデータ
  const threats = ['ウイルス', 'フィッシング', 'マルウェア', 'DDoS攻撃', 'ランサムウェア', 'ゼロデイ攻撃', '中間者攻撃'];
  const defenses = ['アンチウイルス', 'ファイアウォール', '暗号化', 'バックアップ', '教育', 'パッチ管理', '多要素認証'];
  
  const [defenseLevels, setDefenseLevels] = useState(
    defenses.reduce((acc, defense) => ({ ...acc, [defense]: 1 }), {})
  );

  // セキュリティログ
  const [securityLogs, setSecurityLogs] = useState([]);

  // デモアカウント
  const demoAccounts = {
    'admin': 'adminPass123!',
    'user': 'userPass456!',
    'test': 'testPass789!'
  };

  // セキュリティログ記録
  const logSecurityEvent = useCallback((eventDescription) => {
    const timestamp = new Date().toLocaleString('ja-JP');
    const logEntry = `[${timestamp}] ${eventDescription}`;
    
    setSecurityLogs(prev => {
      const newLogs = [...prev, logEntry];
      return newLogs.slice(-100); // 最大100件
    });
    
    console.log('セキュリティログ:', logEntry);
  }, []);

  // セッション検証
  const validateSession = useCallback(() => {
    if (!sessionToken || !sessionExpiry || new Date() > sessionExpiry) {
      if (isLoggedIn) {
        logSecurityEvent(`セッションタイムアウト: ${loggedInUser}`);
        handleLogout();
      }
      return false;
    }
    
    // セッション延長
    setSessionExpiry(new Date(Date.now() + 30 * 60 * 1000));
    return true;
  }, [sessionToken, sessionExpiry, isLoggedIn, loggedInUser]);

  // ログイン処理
  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError('ユーザー名とパスワードを入力してください');
      logSecurityEvent('ログイン失敗: 空の入力フィールド');
      return;
    }

    if (password.length < 8) {
      setLoginError('パスワードは最低8文字必要です');
      logSecurityEvent('ログイン失敗: パスワード長不足');
      return;
    }

    // 認証
    if (demoAccounts[username] === password) {
      // セッション作成
      const token = btoa(crypto.getRandomValues(new Uint8Array(32)).join(''));
      setSessionToken(token);
      setSessionExpiry(new Date(Date.now() + 30 * 60 * 1000));
      
      setIsLoggedIn(true);
      setLoggedInUser(username);
      setUserPermissionLevel(username === 'admin' ? 2 : 1);
      setLoginError('');
      setPassword('');
      
      logSecurityEvent(`${username === 'admin' ? '管理者' : '一般ユーザー'}権限でログイン: ${username}`);
      initializeGame();
    } else {
      setLoginError('認証に失敗しました');
      logSecurityEvent(`ログイン失敗: 認証エラー, ユーザー: ${username}`);
    }
  };

  // ログアウト処理
  const handleLogout = useCallback(() => {
    logSecurityEvent(`ユーザーログアウト: ${loggedInUser}`);
    setIsLoggedIn(false);
    setSessionToken('');
    setLoggedInUser('');
    setUserPermissionLevel(0);
    setGameActive(false);
    setStatusText('ログインしてゲームを開始してください');
  }, [loggedInUser, logSecurityEvent]);

  // ゲーム初期化
  const initializeGame = () => {
    setSecurityLevel(50);
    setScore(0);
    setPlayerLevel(1);
    setExperiencePoints(0);
    setDefenseLevels(defenses.reduce((acc, defense) => ({ ...acc, [defense]: 1 }), {}));
    setGameOverVisible(false);
    setLevelUpVisible(false);
    setGameActive(true);
    setStatusText('ゲーム開始：ハチ公のデータを守れ！');
    logSecurityEvent(`ゲーム開始: プレイヤー ${loggedInUser}`);
  };

  // 脅威生成
  const generateThreat = useCallback(async () => {
    if (!validateSession() || securityLevel <= 0 || !gameActive) return;

    const threat = threats[Math.floor(Math.random() * threats.length)];
    const damage = Math.floor(Math.random() * 10) + 5 + (playerLevel - 1) * 2;

    // 暗号化デモ
    const encryptedThreatData = await encryptData(`${threat}:${damage}`, 'HachikoSecureKey');
    const decryptedData = await decryptData(encryptedThreatData, 'HachikoSecureKey');
    
    if (decryptedData) {
      const [decryptedThreat, damageStr] = decryptedData.split(':');
      const finalDamage = parseInt(damageStr);
      
      setSecurityLevel(prev => Math.max(0, prev - finalDamage));
      setStatusText(`脅威検出: ${decryptedThreat}がハチ公のデータを攻撃中！\nセキュリティレベル: ${finalDamage}ポイント減少`);
      
      logSecurityEvent(`脅威検出: ${decryptedThreat}, ダメージ量: ${finalDamage}, 残セキュリティ: ${securityLevel - finalDamage}%`);
    }
  }, [validateSession, securityLevel, gameActive, playerLevel, loggedInUser, threats]);

  // 防御アクション
  const handleDefenseAction = (defenseIndex) => {
    if (!validateSession() || securityLevel <= 0) return;

    const defense = defenses[defenseIndex];
    const defenseLevel = defenseLevels[defense];

    // 権限チェック
    if (defense === '多要素認証' && userPermissionLevel < 2) {
      setStatusText('権限エラー: 多要素認証の設定には管理者権限が必要です');
      logSecurityEvent(`権限エラー: 多要素認証アクセス拒否, ユーザー: ${loggedInUser}`);
      return;
    }

    const protection = Math.floor(Math.random() * 10) + 5 + (defenseLevel - 1) * 2;
    
    setSecurityLevel(prev => Math.min(prev + protection, 100));
    setScore(prev => prev + 10 * playerLevel);
    setExperiencePoints(prev => prev + 5);
    
    setStatusText(`${defense} (Lv.${defenseLevel})を実施: セキュリティレベルが${protection}ポイント上昇`);
    
    logSecurityEvent(`防御アクション: ${defense} (Lv.${defenseLevel}), 効果: +${protection}%, 現セキュリティ: ${securityLevel + protection}%`);
  };

  // レベルアップ確認
  useEffect(() => {
    if (experiencePoints >= 100) {
      setPlayerLevel(prev => prev + 1);
      setExperiencePoints(prev => prev - 100);
      setLevelUpVisible(true);
      setStatusText(`レベルアップ！プレイヤーレベルが${playerLevel + 1}になりました。`);
      logSecurityEvent(`レベルアップ: プレイヤー ${loggedInUser}, 新レベル: ${playerLevel + 1}`);
    }
  }, [experiencePoints, playerLevel, loggedInUser]);

  // ゲームオーバー確認
  useEffect(() => {
    if (securityLevel <= 0 && gameActive) {
      setStatusText('ゲームオーバー：ハチ公のデータが完全に侵害されました。');
      setGameOverVisible(true);
      setGameActive(false);
      logSecurityEvent(`ゲームオーバー: プレイヤー ${loggedInUser}, 最終スコア: ${score}`);
    }
  }, [securityLevel, gameActive, loggedInUser, score]);

  // 脅威の定期生成
  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(generateThreat, 5000);
      return () => clearInterval(interval);
    }
  }, [gameActive, generateThreat]);

  // 防御アップグレード
  const upgradeDefense = (defenseIndex) => {
    const defense = defenses[defenseIndex];
    setDefenseLevels(prev => ({
      ...prev,
      [defense]: prev[defense] + 1
    }));
    setLevelUpVisible(false);
    logSecurityEvent(`防御アップグレード: ${defense}, 新レベル: ${defenseLevels[defense] + 1}`);
  };

  // ゲーム再開
  const restartGame = () => {
    if (!validateSession()) return;
    initializeGame();
    logSecurityEvent(`ゲーム再開: プレイヤー ${loggedInUser}`);
  };

  // データエクスポート
  const exportPlayerData = async () => {
    if (userPermissionLevel < 2) {
      setStatusText('権限エラー: データエクスポートには管理者権限が必要です');
      logSecurityEvent(`権限エラー: データエクスポートアクセス拒否, ユーザー: ${loggedInUser}`);
      return;
    }

    const playerData = JSON.stringify({
      playerName: loggedInUser,
      score,
      level: playerLevel,
      securityLevel,
      experiencePoints
    }, null, 2);

    const encryptedData = await encryptData(playerData, 'HachikoSecureKey');
    
    const blob = new Blob([encryptedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player_data_${loggedInUser}.dat`;
    a.click();
    URL.revokeObjectURL(url);
    
    logSecurityEvent(`プレイヤーデータエクスポート: 管理者 ${loggedInUser}`);
  };

  // ログ表示
  const toggleLogs = () => {
    if (userPermissionLevel < 2) {
      setStatusText('権限エラー: セキュリティログの閲覧には管理者権限が必要です');
      logSecurityEvent(`権限エラー: ログ閲覧アクセス拒否, ユーザー: ${loggedInUser}`);
      return;
    }
    setLogsVisible(!logsVisible);
    logSecurityEvent(`セキュリティログ閲覧: 管理者 ${loggedInUser}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">ハチ公サイバーセキュリティ</h1>
            <p className="text-gray-300">データを守るゲーム</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{loginError}</p>
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Lock className="w-5 h-5 inline mr-2" />
              ログイン
            </button>
            
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mt-4">
              <p className="text-yellow-300 text-sm font-semibold mb-2">デモアカウント:</p>
              <p className="text-yellow-200 text-xs">admin / adminPass123!</p>
              <p className="text-yellow-200 text-xs">user / userPass456!</p>
              <p className="text-yellow-200 text-xs">test / testPass789!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">ハチ公サイバーセキュリティ</h1>
                <p className="text-gray-300">ようこそ、{loggedInUser}さん ({userPermissionLevel === 2 ? '管理者' : 'ユーザー'})</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {userPermissionLevel === 2 && (
                <>
                  <button
                    onClick={toggleLogs}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 p-2 rounded-lg transition-colors"
                    title="セキュリティログ"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={exportPlayerData}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-2 rounded-lg transition-colors"
                    title="データエクスポート"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-lg transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ゲーム状態 */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">セキュリティレベル</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">現在のレベル</span>
                <span className="text-white font-semibold">{securityLevel}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    securityLevel > 60 ? 'bg-green-500' : 
                    securityLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${securityLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">スコア</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-300">{score.toLocaleString()}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">プレイヤー</h3>
            </div>
            <div className="space-y-1">
              <p className="text-white">レベル {playerLevel}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${experiencePoints}%` }}
                />
              </div>
              <p className="text-xs text-gray-300">経験値: {experiencePoints}/100</p>
            </div>
          </div>
        </div>

        {/* ステータステキスト */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <p className="text-white whitespace-pre-line">{statusText}</p>
          </div>
        </div>

        {/* 防御アクション */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">防御アクション</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {defenses.map((defense, index) => {
              const isRestricted = defense === '多要素認証' && userPermissionLevel < 2;
              return (
                <button
                  key={defense}
                  onClick={() => !isRestricted && handleDefenseAction(index)}
                  disabled={!gameActive || isRestricted}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isRestricted 
                      ? 'bg-red-500/10 border-red-500/30 text-red-300 cursor-not-allowed'
                      : gameActive
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400 transform hover:scale-105'
                      : 'bg-gray-500/20 border-gray-500/30 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold">{defense}</p>
                    <p className="text-sm opacity-75">Lv.{defenseLevels[defense]}</p>
                    {isRestricted && (
                      <p className="text-xs mt-1">管理者権限必要</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ゲームコントロール */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex justify-center space-x-4">
            {!gameActive && (
              <button
                onClick={restartGame}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                ゲーム再開
              </button>
            )}
          </div>
        </div>

        {/* ゲームオーバーモーダル */}
        {gameOverVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4 border border-white/20">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">ゲームオーバー</h2>
                <p className="text-gray-300 mb-6">ハチ公のデータが完全に侵害されました</p>
                <p className="text-yellow-300 mb-6">最終スコア: {score.toLocaleString()}</p>
                <button
                  onClick={() => setGameOverVisible(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* レベルアップモーダル */}
        {levelUpVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4 border border-white/20">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">レベルアップ！</h2>
                <p className="text-gray-300 mb-6">防御をアップグレードしてください</p>
                <div className="space-y-2">
                  {defenses.slice(0, 3).map((defense, index) => (
                    <button
                      key={defense}
                      onClick={() => upgradeDefense(index)}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 py-2 px-4 rounded-lg transition-colors"
                    >
                      {defense} (Lv.{defenseLevels[defense]} → {defenseLevels[defense] + 1})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* セキュリティログモーダル */}
        {logsVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-4 border border-white/20 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">セキュリティログ</h2>
                <button
                  onClick={() => setLogsVisible(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-green-300 overflow-auto flex-1">
                {securityLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HachikoCyberSecurityGame;
