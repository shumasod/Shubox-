import React, { useState } from 'react';
import { Box, Layers, Image, Settings, Sun, Share2, Save, HelpCircle, Move, RotateCcw, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

const DioramaApp = () => {
  const [activeTab, setActiveTab] = useState('canvas');
  const [activeObject, setActiveObject] = useState(null);

  const renderCanvas = () => (
    <div className="bg-gray-200 w-full h-96 flex items-center justify-center relative">
      <p className="text-gray-600">3D キャンバス領域（Three.js を使用）</p>
      {activeObject && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
          <p>選択中: {activeObject}</p>
        </div>
      )}
    </div>
  );

  const renderAssetsLibrary = () => (
    <div className="bg-white p-4 border rounded">
      <h3 className="font-bold mb-2">アセット（ドラッグ＆ドロップでキャンバスに配置）</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-100 p-2 text-center cursor-move" draggable onDragStart={() => setActiveObject('建物1')}>建物1</div>
        <div className="bg-gray-100 p-2 text-center cursor-move" draggable onDragStart={() => setActiveObject('木1')}>木1</div>
        <div className="bg-gray-100 p-2 text-center cursor-move" draggable onDragStart={() => setActiveObject('車1')}>車1</div>
        <div className="bg-gray-100 p-2 text-center cursor-move" draggable onDragStart={() => setActiveObject('地形1')}>地形1</div>
        <div className="bg-gray-100 p-2 text-center cursor-move" draggable onDragStart={() => setActiveObject('人物1')}>人物1</div>
        <div className="bg-gray-100 p-2 text-center cursor-move" draggable onDragStart={() => setActiveObject('道路1')}>道路1</div>
      </div>
    </div>
  );

  const renderObjectControls = () => (
    <div className="bg-white p-4 border rounded mt-4">
      <h3 className="font-bold mb-2">オブジェクト操作</h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">位置 <Move className="inline h-4 w-4" /></label>
          <div className="flex space-x-2">
            <Slider defaultValue={[0]} max={100} step={1} />
            <Slider defaultValue={[0]} max={100} step={1} />
            <Slider defaultValue={[0]} max={100} step={1} />
          </div>
        </div>
        <div>
          <label className="block mb-2">回転 <RotateCcw className="inline h-4 w-4" /></label>
          <div className="flex space-x-2">
            <Slider defaultValue={[0]} max={360} step={1} />
            <Slider defaultValue={[0]} max={360} step={1} />
            <Slider defaultValue={[0]} max={360} step={1} />
          </div>
        </div>
        <div>
          <label className="block mb-2">スケール <Scale className="inline h-4 w-4" /></label>
          <div className="flex space-x-2">
            <Slider defaultValue={[1]} max={2} step={0.1} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'canvas':
        return (
          <>
            {renderCanvas()}
            {renderObjectControls()}
          </>
        );
      case 'assets':
        return renderAssetsLibrary();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>3D ノーコード ジオラマ作成アプリ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList>
              <TabsTrigger value="canvas"><Box className="mr-2 h-4 w-4" /> 3D キャンバス</TabsTrigger>
              <TabsTrigger value="assets"><Image className="mr-2 h-4 w-4" /> アセット</TabsTrigger>
            </TabsList>
            <TabsContent value="canvas">{renderContent()}</TabsContent>
            <TabsContent value="assets">{renderContent()}</TabsContent>
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