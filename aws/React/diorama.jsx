import React, { useState } from 'react';
import { Layers, Image, Grid, Settings, Sun, Share2, Save, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DioramaApp = () => {
  const [activeTab, setActiveTab] = useState('canvas');

  const renderCanvas = () => (
    <div className="bg-gray-200 w-full h-96 flex items-center justify-center">
      <p className="text-gray-600">3D キャンバス領域（Three.js を使用）</p>
    </div>
  );

  const renderLayersPanel = () => (
    <div className="bg-white p-4 border rounded">
      <h3 className="font-bold mb-2">レイヤー</h3>
      <ul>
        <li>地形</li>
        <li>建物</li>
        <li>植物</li>
        <li>装飾品</li>
      </ul>
    </div>
  );

  const renderAssetsLibrary = () => (
    <div className="bg-white p-4 border rounded">
      <h3 className="font-bold mb-2">アセット</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-100 p-2 text-center">建物1</div>
        <div className="bg-gray-100 p-2 text-center">木1</div>
        <div className="bg-gray-100 p-2 text-center">車1</div>
        <div className="bg-gray-100 p-2 text-center">地形1</div>
        <div className="bg-gray-100 p-2 text-center">人物1</div>
        <div className="bg-gray-100 p-2 text-center">道路1</div>
      </div>
    </div>
  );

  const renderSettingsPanel = () => (
    <div className="bg-white p-4 border rounded">
      <h3 className="font-bold mb-2">設定</h3>
      <div className="space-y-2">
        <div>解像度: 1920x1080</div>
        <div>品質: 高</div>
        <div>自動保存: オン</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'canvas':
        return renderCanvas();
      case 'layers':
        return renderLayersPanel();
      case 'assets':
        return renderAssetsLibrary();
      case 'settings':
        return renderSettingsPanel();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>ジオラマ作成アプリ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList>
              <TabsTrigger value="canvas"><Grid className="mr-2 h-4 w-4" /> キャンバス</TabsTrigger>
              <TabsTrigger value="layers"><Layers className="mr-2 h-4 w-4" /> レイヤー</TabsTrigger>
              <TabsTrigger value="assets"><Image className="mr-2 h-4 w-4" /> アセット</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> 設定</TabsTrigger>
            </TabsList>
            <TabsContent value="canvas">{renderCanvas()}</TabsContent>
            <TabsContent value="layers">{renderLayersPanel()}</TabsContent>
            <TabsContent value="assets">{renderAssetsLibrary()}</TabsContent>
            <TabsContent value="settings">{renderSettingsPanel()}</TabsContent>
          </Tabs>
          <div className="mt-4 flex justify-between">
            <Button variant="outline"><Sun className="mr-2 h-4 w-4" /> ライティング</Button>
            <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> 共有</Button>
            <Button variant="outline"><Save className="mr-2 h-4 w-4" /> エクスポート</Button>
            <Button variant="outline"><HelpCircle className="mr-2 h-4 w-4" /> ヘルプ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DioramaApp;