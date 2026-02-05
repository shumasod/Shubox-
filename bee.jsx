import React, { useState, useRef, useEffect } from ‘react’;
import { AlertTriangle, Eye, MapPin, Clock, Plus, Bell, Shield, X } from ‘lucide-react’;

const BeeAlertSystem = () => {
const [sightings, setSightings] = useState([]);
const [alerts, setAlerts] = useState([]);
const [activeTab, setActiveTab] = useState(‘dashboard’);
const [showModal, setShowModal] = useState(false);
const [newSighting, setNewSighting] = useState({
location: ‘’,
beeType: ‘’,
count: ‘’,
dangerLevel: ‘low’,
description: ‘’
});

const modalRef = useRef(null);
const firstInputRef = useRef(null);

// アラートレベルの計算
const calculateAlertLevel = () => {
const recentSightings = sightings.filter(s => {
const sightingDate = new Date(s.timestamp);
const now = new Date();
return (now - sightingDate) < 24 * 60 * 60 * 1000; // 24時間以内
});

```
const highDangerCount = recentSightings.filter(s => s.dangerLevel === 'high').length;
const mediumDangerCount = recentSightings.filter(s => s.dangerLevel === 'medium').length;

if (highDangerCount >= 2) return 'high';
if (highDangerCount >= 1 || mediumDangerCount >= 3) return 'medium';
return 'low';
```

};

const alertLevel = calculateAlertLevel();

// モーダルのアクセシビリティ管理
useEffect(() => {
if (showModal && firstInputRef.current) {
firstInputRef.current.focus();
}
}, [showModal]);

// ESCキーでモーダルを閉じる
useEffect(() => {
const handleEscape = (e) => {
if (e.key === ‘Escape’ && showModal) {
setShowModal(false);
}
};
document.addEventListener(‘keydown’, handleEscape);
return () => document.removeEventListener(‘keydown’, handleEscape);
}, [showModal]);

const handleSubmit = (e) => {
e.preventDefault();
if (!newSighting.location || !newSighting.beeType) {
alert(‘場所と蜂の種類は必須項目です’);
return;
}

```
const sighting = {
  id: Date.now(),
  ...newSighting,
  timestamp: new Date().toISOString(),
  count: parseInt(newSighting.count) || 1
};

setSightings(prev => [sighting, ...prev]);

// 高危険度の場合はアラートを追加
if (newSighting.dangerLevel === 'high') {
  setAlerts(prev => [{
    id: Date.now(),
    message: `高危険度の蜂が${newSighting.location}で目撃されました`,
    timestamp: new Date().toISOString(),
    type: 'danger'
  }, ...prev]);
}

setNewSighting({
  location: '',
  beeType: '',
  count: '',
  dangerLevel: 'low',
  description: ''
});
setShowModal(false);
```

};

const getDangerLevelColor = (level) => {
switch (level) {
case ‘high’: return ‘text-red-600 bg-red-50 border-red-200’;
case ‘medium’: return ‘text-yellow-600 bg-yellow-50 border-yellow-200’;
default: return ‘text-green-600 bg-green-50 border-green-200’;
}
};

const getDangerLevelText = (level) => {
switch (level) {
case ‘high’: return ‘高危険’;
case ‘medium’: return ‘中危険’;
default: return ‘低危険’;
}
};

const TabButton = ({ tabId, children, active }) => (
<button
onClick={() => setActiveTab(tabId)}
className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${ active  ? 'border-blue-500 text-blue-600 bg-blue-50'  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}
role=“tab”
aria-selected={active}
aria-controls={`panel-${tabId}`}
id={`tab-${tabId}`}
>
{children}
</button>
);

return (
<div className="min-h-screen bg-gray-50 p-4">
<div className="max-w-6xl mx-auto">
{/* ヘッダー */}
<header className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
<div className="flex items-center justify-between">
<div className="flex items-center space-x-3">
<Shield className="h-8 w-8 text-blue-600" aria-hidden="true" />
<div>
<h1 className="text-2xl font-bold text-gray-900">ハチ警戒システム</h1>
<p className="text-sm text-gray-600">蜂の目撃情報を管理し、危険度を監視します</p>
</div>
</div>
<div className={`px-4 py-2 rounded-full border ${getDangerLevelColor(alertLevel)}`}>
<span className="font-medium">現在の警戒レベル: {getDangerLevelText(alertLevel)}</span>
</div>
</div>
</header>

```
    {/* ナビゲーション */}
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" role="tablist">
      <div className="flex space-x-0 border-b border-gray-200">
        <TabButton tabId="dashboard" active={activeTab === 'dashboard'}>
          <Eye className="w-4 h-4 inline mr-2" aria-hidden="true" />
          ダッシュボード
        </TabButton>
        <TabButton tabId="sightings" active={activeTab === 'sightings'}>
          <MapPin className="w-4 h-4 inline mr-2" aria-hidden="true" />
          目撃情報
        </TabButton>
        <TabButton tabId="alerts" active={activeTab === 'alerts'}>
          <Bell className="w-4 h-4 inline mr-2" aria-hidden="true" />
          アラート ({alerts.length})
        </TabButton>
      </div>
    </nav>

    {/* ダッシュボード */}
    {activeTab === 'dashboard' && (
      <div role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">総目撃件数</h3>
            <p className="text-3xl font-bold text-blue-600">{sightings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24時間以内</h3>
            <p className="text-3xl font-bold text-orange-600">
              {sightings.filter(s => {
                const sightingDate = new Date(s.timestamp);
                const now = new Date();
                return (now - sightingDate) < 24 * 60 * 60 * 1000;
              }).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">高危険度件数</h3>
            <p className="text-3xl font-bold text-red-600">
              {sightings.filter(s => s.dangerLevel === 'high').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の目撃情報</h3>
          {sightings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ目撃情報がありません</p>
          ) : (
            <div className="space-y-3">
              {sightings.slice(0, 5).map(sighting => (
                <div key={sighting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-gray-900">{sighting.location}</p>
                      <p className="text-sm text-gray-600">{sighting.beeType} - {sighting.count}匹</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getDangerLevelColor(sighting.dangerLevel)}`}>
                      {getDangerLevelText(sighting.dangerLevel)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(sighting.timestamp).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* 目撃情報タブ */}
    {activeTab === 'sightings' && (
      <div role="tabpanel" id="panel-sightings" aria-labelledby="tab-sightings">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">目撃情報一覧</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="新しい目撃情報を追加"
          >
            <Plus className="w-4 h-4 inline mr-2" aria-hidden="true" />
            新規追加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {sightings.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
              <p className="text-gray-500">目撃情報がありません</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
              >
                最初の目撃情報を追加する
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sightings.map(sighting => (
                <div key={sighting.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{sighting.location}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getDangerLevelColor(sighting.dangerLevel)}`}>
                          {getDangerLevelText(sighting.dangerLevel)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>蜂の種類:</strong> {sighting.beeType}</p>
                        <p><strong>目撃数:</strong> {sighting.count}匹</p>
                        {sighting.description && (
                          <p><strong>詳細:</strong> {sighting.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                        {new Date(sighting.timestamp).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* アラートタブ */}
    {activeTab === 'alerts' && (
      <div role="tabpanel" id="panel-alerts" aria-labelledby="tab-alerts">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">アラート一覧</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
              <p className="text-gray-500">アラートはありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map(alert => (
                <div key={alert.id} className="p-6 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <button
                    onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                    aria-label="アラートを削除"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* モーダル */}
    {showModal && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
      >
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              新しい目撃情報を追加
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              aria-label="モーダルを閉じる"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                場所 <span className="text-red-500" aria-label="必須">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                id="location"
                required
                value={newSighting.location}
                onChange={(e) => setNewSighting(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 駐車場の花壇"
              />
            </div>

            <div>
              <label htmlFor="beeType" className="block text-sm font-medium text-gray-700 mb-1">
                蜂の種類 <span className="text-red-500" aria-label="必須">*</span>
              </label>
              <select
                id="beeType"
                required
                value={newSighting.beeType}
                onChange={(e) => setNewSighting(prev => ({ ...prev, beeType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                <option value="スズメバチ">スズメバチ</option>
                <option value="アシナガバチ">アシナガバチ</option>
                <option value="ミツバチ">ミツバチ</option>
                <option value="クマバチ">クマバチ</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                目撃数（匹）
              </label>
              <input
                type="number"
                id="count"
                min="1"
                value={newSighting.count}
                onChange={(e) => setNewSighting(prev => ({ ...prev, count: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
            </div>

            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">危険度</legend>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: '低危険（通常の活動）', color: 'text-green-600' },
                    { value: 'medium', label: '中危険（活発な活動）', color: 'text-yellow-600' },
                    { value: 'high', label: '高危険（攻撃的な行動）', color: 'text-red-600' }
                  ].map(level => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="radio"
                        name="dangerLevel"
                        value={level.value}
                        checked={newSighting.dangerLevel === level.value}
                        onChange={(e) => setNewSighting(prev => ({ ...prev, dangerLevel: e.target.value }))}
                        className="mr-2 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className={level.color}>{level.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                詳細（任意）
              </label>
              <textarea
                id="description"
                rows="3"
                value={newSighting.description}
                onChange={(e) => setNewSighting(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="巣の有無、行動の詳細など"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
```

);
};

export default BeeAlertSystem;