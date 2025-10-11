import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Server, Cloud, Globe } from 'lucide-react';

// AWS ACMの証明書データをシミュレート
const generateAWSCerts = () => {
  const regions = ['us-east-1', 'us-west-2', 'ap-northeast-1', 'eu-west-1'];
  const services = ['CloudFront', 'ALB', 'API Gateway', 'ELB'];
  const domains = [
    'example.com', 'www.example.com', 'api.example.com', 'admin.example.com',
    'app.example.com', 'cdn.example.com', 'static.example.com', 'images.example.com',
    'auth.example.com', 'payment.example.com', 'dashboard.example.com', 'portal.example.com',
    'shop.example.com', 'blog.example.com', 'docs.example.com', 'support.example.com',
    'staging.example.com', 'dev.example.com', 'test.example.com', 'demo.example.com',
    'mobile.example.com', 'video.example.com', 'stream.example.com', 'live.example.com',
    'analytics.example.com', 'monitor.example.com', 'status.example.com', 'health.example.com',
    'crm.example.com', 'erp.example.com', 'mail.example.com', 'webmail.example.com'
  ];

  return domains.map((domain, idx) => {
    const daysUntilExpiry = Math.floor(Math.random() * 90);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
    
    return {
      id: `arn:aws:acm:${regions[idx % regions.length]}:123456789012:certificate/${Math.random().toString(36).substr(2, 9)}`,
      domain,
      region: regions[idx % regions.length],
      service: services[idx % services.length],
      certificateArn: `arn:aws:acm:${regions[idx % regions.length]}:123456789012:certificate/${Math.random().toString(36).substr(2, 9)}`,
      expiryDate: expiryDate.toISOString().split('T')[0],
      daysUntilExpiry,
      status: 'ISSUED',
      inUseBy: [`${services[idx % services.length]}-${idx + 1}`],
      autoRenew: Math.random() > 0.3,
      validationMethod: Math.random() > 0.5 ? 'DNS' : 'EMAIL',
      lastChecked: new Date().toISOString()
    };
  });
};

const AWSSSLManager = () => {
  const [certificates, setCertificates] = useState(generateAWSCerts());
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [logs, setLogs] = useState([]);

  // ログを追加
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    setLogs(prev => [{timestamp, message, type}, ...prev.slice(0, 99)]);
  };

  // 証明書を更新（ACM自動更新をトリガー）
  const renewCertificate = async (certId) => {
    const cert = certificates.find(c => c.id === certId);
    setUpdatingIds(prev => new Set([...prev, certId]));
    addLog(`${cert.domain} の証明書更新を開始...`, 'info');
    
    // AWS ACM API呼び出しをシミュレート
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
    
    // 更新処理
    setCertificates(prev => prev.map(c => {
      if (c.id === certId) {
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + 90);
        addLog(`✓ ${c.domain} の証明書更新完了 (有効期限: 90日)`, 'success');
        return {
          ...c,
          expiryDate: newExpiryDate.toISOString().split('T')[0],
          daysUntilExpiry: 90,
          status: 'ISSUED',
          lastChecked: new Date().toISOString()
        };
      }
      return c;
    }));
    
    setUpdatingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(certId);
      return newSet;
    });
  };

  // 全証明書を一括更新
  const renewAllCertificates = async () => {
    setIsUpdating(true);
    addLog('=== 一括更新処理を開始 ===', 'info');
    
    const certsToRenew = filteredCertificates;
    setUpdatingIds(new Set(certsToRenew.map(c => c.id)));
    
    // リージョンごとにグループ化して更新
    const certsByRegion = {};
    certsToRenew.forEach(cert => {
      if (!certsByRegion[cert.region]) {
        certsByRegion[cert.region] = [];
      }
      certsByRegion[cert.region].push(cert);
    });

    for (const [region, certs] of Object.entries(certsByRegion)) {
      addLog(`${region} リージョンの証明書を更新中...`, 'info');
      
      // リージョンごとに並列処理
      await Promise.all(certs.map(cert => renewCertificate(cert.id)));
    }
    
    setIsUpdating(false);
    setUpdatingIds(new Set());
    addLog('=== すべての証明書更新が完了しました ===', 'success');
  };

  // ステータスアイコン
  const getStatusIcon = (cert) => {
    if (updatingIds.has(cert.id)) {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (cert.daysUntilExpiry < 7) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (cert.daysUntilExpiry < 30) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  // フィルタリング
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || cert.region === selectedRegion;
    
    if (!matchesSearch || !matchesRegion) return false;
    
    switch (filter) {
      case 'expiring':
        return cert.daysUntilExpiry < 30;
      case 'critical':
        return cert.daysUntilExpiry < 7;
      case 'healthy':
        return cert.daysUntilExpiry >= 30;
      case 'noAutoRenew':
        return !cert.autoRenew;
      default:
        return true;
    }
  });

  // 統計情報
  const stats = {
    total: certificates.length,
    critical: certificates.filter(c => c.daysUntilExpiry < 7).length,
    expiring: certificates.filter(c => c.daysUntilExpiry < 30 && c.daysUntilExpiry >= 7).length,
    healthy: certificates.filter(c => c.daysUntilExpiry >= 30).length,
    noAutoRenew: certificates.filter(c => !c.autoRenew).length
  };

  const regions = [...new Set(certificates.map(c => c.region))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-orange-500">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Cloud className="w-10 h-10 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">AWS Certificate Manager</h1>
                <p className="text-slate-600 text-sm">SSL/TLS証明書一括管理システム</p>
              </div>
            </div>
            <button
              onClick={renewAllCertificates}
              disabled={isUpdating || filteredCertificates.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-md"
            >
              <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? '更新中...' : 'すべて更新'}
            </button>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-slate-600 text-sm mb-1">総証明書数</div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="text-red-600 text-sm mb-1">緊急 (7日以内)</div>
              <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="text-yellow-700 text-sm mb-1">要注意 (30日以内)</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.expiring}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 text-sm mb-1">正常</div>
              <div className="text-2xl font-bold text-green-700">{stats.healthy}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="text-orange-600 text-sm mb-1">手動更新</div>
              <div className="text-2xl font-bold text-orange-700">{stats.noAutoRenew}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="col-span-2">
            {/* フィルターと検索 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="ドメイン名またはサービスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">全リージョン</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">すべて表示</option>
                  <option value="critical">緊急のみ</option>
                  <option value="expiring">要注意のみ</option>
                  <option value="healthy">正常のみ</option>
                  <option value="noAutoRenew">手動更新のみ</option>
                </select>
              </div>
            </div>

            {/* 証明書リスト */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">状態</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">ドメイン</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">サービス</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">リージョン</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">残日数</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">自動更新</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusIcon(cert)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{cert.domain}</div>
                          <div className="text-xs text-slate-500">{cert.validationMethod}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-sm">
                          {cert.service}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-sm">
                          {cert.region}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            cert.daysUntilExpiry < 7 ? 'bg-red-100 text-red-700' :
                            cert.daysUntilExpiry < 30 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {cert.daysUntilExpiry}日
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {cert.autoRenew ? (
                            <span className="text-green-600 text-sm">有効</span>
                          ) : (
                            <span className="text-orange-600 text-sm font-semibold">手動</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => renewCertificate(cert.id)}
                            disabled={updatingIds.has(cert.id)}
                            className="text-orange-600 hover:text-orange-800 disabled:text-gray-400 disabled:cursor-not-allowed font-medium text-sm"
                          >
                            {updatingIds.has(cert.id) ? '更新中...' : '更新'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ログパネル */}
          <div className="col-span-1">
            <div className="bg-slate-900 rounded-lg shadow-lg p-4 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-semibold">更新ログ</h3>
              </div>
              <div className="bg-black rounded p-3 h-[650px] overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-slate-500">ログがありません</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className={`mb-2 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      'text-slate-300'
                    }`}>
                      <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSSSLManager;
