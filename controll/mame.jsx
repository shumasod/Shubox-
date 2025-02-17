import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Bell,
  Battery,
  Bluetooth,
  Settings,
  Home,
  AlertTriangle,
  Activity,
  Power,
  Eye,
  EyeOff,
  RefreshCcw,
  Wifi
} from 'lucide-react';

const SetsubunMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [systemStatus, setSystemStatus] = useState({
    isActive: true,
    batteryLevel: 85,
    isConnected: true,
    signalStrength: 78,
    lastUpdate: new Date(),
    alerts: []
  });
  const [detectionData, setDetectionData] = useState({
    motion: false,
    distance: 5.2,
    noiseLevel: 32
  });

  // 警告レベルの判定
  const getAlertLevel = useCallback(() => {
    if (!systemStatus.isActive) return 'inactive';
    if (!detectionData.motion) return 'normal';
    if (detectionData.distance <= 1) return 'danger';
    if (detectionData.distance <= 3) return 'warning';
    return 'normal';
  }, [systemStatus.isActive, detectionData]);

  // 警告スタイルの設定
  const alertStyles = {
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: <Power className="w-5 h-5" />,
      message: 'システム停止中'
    },
    normal: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: <Eye className="w-5 h-5" />,
      message: '監視中'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: <AlertTriangle className="w-5 h-5" />,
      message: '接近検知'
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: <Bell className="w-5 h-5" />,
      message: '警戒レベル'
    }
  };

  const currentAlert = alertStyles[getAlertLevel()];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ヘッダー */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">鬼検知システム</h1>
          <div className="flex space-x-2 items-center">
            <Battery className={`w-5 h-5 ${
              systemStatus.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'
            }`} />
            <Bluetooth className={`w-5 h-5 ${
              systemStatus.isConnected ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>
        </div>
      </div>

      {/* メインステータス */}
      <Card className={`mb-4 ${currentAlert.bg}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentAlert.icon}
              <span className={`font-medium ${currentAlert.text}`}>
                {currentAlert.message}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {detectionData.distance.toFixed(1)}m
            </span>
          </div>
        </CardContent>
      </Card>

      {/* タブナビゲーション */}
      <Tabs defaultValue="monitor" className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor">
            <Home className="w-4 h-4 mr-1" />
            監視
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="w-4 h-4 mr-1" />
            状態
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-1" />
            設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">動体検知</label>
                  <div className={`p-2 rounded ${
                    detectionData.motion ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {detectionData.motion ? '検知中' : '検知なし'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">検知距離</label>
                  <div className="p-2 rounded bg-blue-100 text-blue-600">
                    {detectionData.distance.toFixed(1)}m
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-600">ノイズレベル</label>
                <Progress value={detectionData.noiseLevel} className="h-2" />
                <div className="text-right text-sm text-gray-500">
                  {detectionData.noiseLevel}%
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">バッテリー残量</span>
                  <span className="text-sm font-medium">
                    {systemStatus.batteryLevel}%
                  </span>
                </div>
                <Progress value={systemStatus.batteryLevel} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">電波強度</span>
                  <span className="text-sm font-medium">
                    {systemStatus.signalStrength}%
                  </span>
                </div>
                <Progress value={systemStatus.signalStrength} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">最終更新</span>
                  <span className="text-sm text-gray-500">
                    {systemStatus.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">システム電源</span>
                <button
                  onClick={() => setSystemStatus(prev => ({
                    ...prev,
                    isActive: !prev.isActive
                  }))}
                  className={`px-4 py-2 rounded ${
                    systemStatus.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {systemStatus.isActive ? '稼働中' : '停止中'}
                </button>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-center space-x-2 p-2 rounded bg-blue-500 text-white">
                  <RefreshCcw className="w-4 h-4" />
                  <span>センサー再キャリブレーション</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 p-2 rounded bg-gray-200 text-gray-700">
                  <Wifi className="w-4 h-4" />
                  <span>ネットワーク設定</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アラート履歴 */}
      {systemStatus.alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {systemStatus.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type}>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetsubunMobileDashboard;
