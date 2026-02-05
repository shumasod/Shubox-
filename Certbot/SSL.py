<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python コーディングパズル - ACM証明書管理</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .progress-bar {
            background: rgba(255,255,255,0.3);
            height: 10px;
            border-radius: 5px;
            margin-top: 20px;
            overflow: hidden;
        }
        
        .progress-fill {
            background: #10b981;
            height: 100%;
            width: 0%;
            transition: width 0.5s ease;
        }
        
        .level-selector {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 20px;
            background: #f8fafc;
            flex-wrap: wrap;
        }
        
        .level-btn {
            padding: 10px 20px;
            border: 2px solid #3b82f6;
            background: white;
            color: #3b82f6;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .level-btn:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
            transform: translateY(-2px);
        }
        
        .level-btn.active {
            background: #3b82f6;
            color: white;
        }
        
        .level-btn.completed {
            background: #10b981;
            border-color: #10b981;
            color: white;
        }
        
        .level-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .content {
            padding: 30px;
        }
        
        .puzzle {
            display: none;
        }
        
        .puzzle.active {
            display: block;
            animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .puzzle-title {
            color: #3b82f6;
            font-size: 1.5em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .difficulty {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.6em;
            font-weight: bold;
        }
        
        .difficulty.easy { background: #10b981; color: white; }
        .difficulty.medium { background: #f59e0b; color: white; }
        .difficulty.hard { background: #ef4444; color: white; }
        .difficulty.expert { background: #8b5cf6; color: white; }
        
        .puzzle-description {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            line-height: 1.8;
        }
        
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 15px 0;
            line-height: 1.6;
            white-space: pre;
        }
        
        .code-block .comment { color: #6ee7b7; }
        .code-block .keyword { color: #fb923c; }
        .code-block .string { color: #a5f3fc; }
        .code-block .function { color: #fde047; }
        
        .answer-area {
            margin: 20px 0;
        }
        
        textarea {
            width: 100%;
            min-height: 200px;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            resize: vertical;
            transition: border-color 0.3s;
            line-height: 1.5;
        }
        
        textarea:focus {
            outline: none;
            border-color: #3b82f6;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        button {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
        }
        
        .submit-btn {
            background: #3b82f6;
            color: white;
        }
        
        .submit-btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
        
        .hint-btn {
            background: #f59e0b;
            color: white;
        }
        
        .hint-btn:hover {
            background: #d97706;
        }
        
        .reset-btn {
            background: #64748b;
            color: white;
        }
        
        .reset-btn:hover {
            background: #475569;
        }
        
        .feedback {
            margin-top: 20px;
            padding: 20px;
            border-radius: 10px;
            display: none;
            animation: slideIn 0.5s;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        .feedback.show {
            display: block;
        }
        
        .feedback.success {
            background: #d1fae5;
            border: 2px solid #10b981;
            color: #065f46;
        }
        
        .feedback.error {
            background: #fee2e2;
            border: 2px solid #ef4444;
            color: #991b1b;
        }
        
        .feedback.hint {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            color: #92400e;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #3b82f6;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.9em;
            margin-top: 5px;
        }
        
        .celebration {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: none;
            z-index: 1000;
            text-align: center;
            max-width: 400px;
        }
        
        .celebration.show {
            display: block;
            animation: bounceIn 0.5s;
        }
        
        @keyframes bounceIn {
            0% { transform: translate(-50%, -50%) scale(0.3); }
            50% { transform: translate(-50%, -50%) scale(1.05); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        .celebration h2 {
            color: #3b82f6;
            font-size: 2em;
            margin-bottom: 20px;
        }
        
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            z-index: 999;
        }
        
        .overlay.show {
            display: block;
        }

        .tip-box {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }

        .tip-box strong {
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="overlay" id="overlay"></div>
    <div class="celebration" id="celebration">
        <h2>🎉 おめでとうございます!</h2>
        <p id="celebrationMessage"></p>
        <button class="submit-btn" onclick="closeCelebration()">次のパズルへ</button>
    </div>
    
    <div class="container">
        <div class="header">
            <h1>🐍 Python コーディングパズル</h1>
            <p>AWS ACM証明書管理コードを改善しよう!</p>
            <div class="progress-bar">
                <div class="progress-fill" id="progressBar"></div>
            </div>
        </div>
        
        <div class="level-selector" id="levelSelector"></div>
        
        <div class="content">
            <div id="puzzleContainer"></div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value" id="solvedCount">0</div>
                    <div class="stat-label">解決済み</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="hintsUsed">0</div>
                    <div class="stat-label">ヒント使用</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="attempts">0</div>
                    <div class="stat-label">挑戦回数</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const puzzles = [
            {
                id: 1,
                title: "Level 1: 型ヒントの追加",
                difficulty: "easy",
                description: `元のコードには型ヒント(Type Hints)がありません。Python 3.5以降では型ヒントを使うことで、コードの可読性と保守性が向上します。<br><br>
                <strong>課題:</strong> MockACMClientクラスのメソッドに型ヒントを追加してください。<br><br>
                <strong>ヒント:</strong> 戻り値の型は Dict[str, Any] などを使います。`,
                code: `from typing import Dict, Any, List

class MockACMClient:
    """ACMクライアントのモック"""
    
    def __init__(self, region):
        self.region = region
    
    def list_certificates(self, **kwargs):
        """証明書リストのモック"""
        return {
            'CertificateSummaryList': [
                {'CertificateArn': cert['CertificateArn']}
                for cert in MOCK_CERTIFICATES
            ]
        }
    
    def describe_certificate(self, CertificateArn):
        """証明書詳細のモック"""
        for cert in MOCK_CERTIFICATES:
            if cert['CertificateArn'] == CertificateArn:
                return {'Certificate': cert}
        raise Exception(f"Certificate not found: {CertificateArn}")`,
                hints: [
                    "引数の型は def __init__(self, region: str) -> None: のように書きます",
                    "辞書型の戻り値は -> Dict[str, Any]: を使います",
                    "typing モジュールから Dict, Any, List などをインポートします"
                ],
                solution: `from typing import Dict, Any, List

class MockACMClient:
    """ACMクライアントのモック"""
    
    def __init__(self, region: str) -> None:
        self.region = region
    
    def list_certificates(self, **kwargs) -> Dict[str, List[Dict[str, str]]]:
        """証明書リストのモック"""
        return {
            'CertificateSummaryList': [
                {'CertificateArn': cert['CertificateArn']}
                for cert in MOCK_CERTIFICATES
            ]
        }
    
    def describe_certificate(self, CertificateArn: str) -> Dict[str, Any]:
        """証明書詳細のモック"""
        for cert in MOCK_CERTIFICATES:
            if cert['CertificateArn'] == CertificateArn:
                return {'Certificate': cert}
        raise Exception(f"Certificate not found: {CertificateArn}")`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /def\s+__init__\s*\([^)]*region:\s*str/i, message: "__init__に型ヒントがあります" },
                        { pattern: /->\s*(None|Dict)/i, message: "戻り値の型ヒントがあります" },
                        { pattern: /CertificateArn:\s*str/i, message: "引数に型ヒントがあります" },
                        { pattern: /from\s+typing\s+import/i, message: "typingモジュールをインポートしています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 3,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 3 ? "素晴らしい!型ヒントでコードが読みやすくなりました!" : "型ヒントの書き方を確認してみましょう。"
                    };
                }
            },
            {
                id: 2,
                title: "Level 2: データクラスの活用",
                difficulty: "easy",
                description: `証明書情報を辞書で扱うのではなく、dataclassを使って構造化しましょう。<br><br>
                <strong>課題:</strong> @dataclass デコレータを使って CertificateInfo クラスを作成してください。<br><br>
                <strong>ヒント:</strong> Python 3.7以降では dataclasses モジュールが使えます。`,
                code: `# 現在の辞書ベースの実装
certificate_info = {
    'domain': cert_detail['DomainName'],
    'region': 'us-east-1',
    'service': service,
    'daysUntilExpiry': days_until_expiry,
    'type': cert_detail.get('Type'),
    'status': cert_detail['Status'],
    'autoRenew': cert_detail.get('Type') == 'AMAZON_ISSUED'
}

# データクラスに変換してください`,
                hints: [
                    "from dataclasses import dataclass をインポートします",
                    "@dataclass デコレータをクラスの前に付けます",
                    "フィールドには型ヒントを付けます: domain: str"
                ],
                solution: `from dataclasses import dataclass
from typing import Optional

@dataclass
class CertificateInfo:
    """証明書情報"""
    domain: str
    region: str
    service: str
    daysUntilExpiry: int
    type: str
    status: str
    autoRenew: bool
    
    def is_expiring_soon(self, days: int = 30) -> bool:
        """期限切れが近いかチェック"""
        return self.daysUntilExpiry <= days
    
    def is_critical(self) -> bool:
        """緊急対応が必要かチェック"""
        return self.daysUntilExpiry <= 7

# 使用例
certificate_info = CertificateInfo(
    domain=cert_detail['DomainName'],
    region='us-east-1',
    service=service,
    daysUntilExpiry=days_until_expiry,
    type=cert_detail.get('Type'),
    status=cert_detail['Status'],
    autoRenew=cert_detail.get('Type') == 'AMAZON_ISSUED'
)`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /@dataclass/i, message: "@dataclassデコレータを使用しています" },
                        { pattern: /class\s+CertificateInfo/i, message: "CertificateInfoクラスを定義しています" },
                        { pattern: /domain:\s*str/i, message: "フィールドに型ヒントがあります" },
                        { pattern: /from\s+dataclasses\s+import/i, message: "dataclassesをインポートしています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 3,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 3 ? "完璧!データクラスで構造化されたコードになりました!" : "dataclassの使い方を確認してみましょう。"
                    };
                }
            },
            {
                id: 3,
                title: "Level 3: loggingモジュールの導入",
                difficulty: "medium",
                description: `print文ではなく、loggingモジュールを使うことで、ログレベルの制御や出力先の変更が容易になります。<br><br>
                <strong>課題:</strong> loggingモジュールを設定し、適切なログレベル(INFO, WARNING, ERROR)でログ出力してください。<br><br>
                <strong>ヒント:</strong> logging.basicConfig() で設定します。`,
                code: `# 現在のprint文
print(f"✅ 合計 {len(certificates)} 件の証明書を取得")
print(f"🚨 緊急 (7日以内に期限切れ):")
print(f"❌ テスト中にエラーが発生しました: {str(e)}")

# loggingモジュールに置き換えてください`,
                hints: [
                    "import logging をインポートします",
                    "logging.basicConfig(level=logging.INFO, format='...') で設定します",
                    "logger.info(), logger.warning(), logger.error() を使います"
                ],
                solution: `import logging
from typing import List

# ロガーの設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('certificate_manager.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def get_certificates() -> List[CertificateInfo]:
    """証明書を取得"""
    try:
        certificates = []
        # ... 証明書取得処理 ...
        
        logger.info(f"合計 {len(certificates)} 件の証明書を取得")
        return certificates
        
    except Exception as e:
        logger.error(f"証明書取得中にエラーが発生: {str(e)}", exc_info=True)
        raise

def check_expiry(certificates: List[CertificateInfo]) -> None:
    """有効期限チェック"""
    critical_certs = [c for c in certificates if c.is_critical()]
    expiring_certs = [c for c in certificates if c.is_expiring_soon() and not c.is_critical()]
    
    if critical_certs:
        logger.critical(f"緊急: {len(critical_certs)}件の証明書が7日以内に期限切れ")
        for cert in critical_certs:
            logger.critical(f"  - {cert.domain}: 残り{cert.daysUntilExpiry}日")
    
    if expiring_certs:
        logger.warning(f"警告: {len(expiring_certs)}件の証明書が30日以内に期限切れ")
        for cert in expiring_certs:
            logger.warning(f"  - {cert.domain}: 残り{cert.daysUntilExpiry}日")
    
    if not critical_certs and not expiring_certs:
        logger.info("期限切れが近い証明書はありません")`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /import\s+logging/i, message: "loggingをインポートしています" },
                        { pattern: /logging\.basicConfig/i, message: "loggingを設定しています" },
                        { pattern: /logger\.(info|warning|error|critical)/i, message: "適切なログレベルを使用しています" },
                        { pattern: /format\s*=|%(asctime|levelname)/i, message: "ログフォーマットを設定しています" },
                        { pattern: /getLogger/i, message: "ロガーインスタンスを取得しています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 4,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 4 ? "素晴らしい!プロフェッショナルなログ実装です!" : "loggingの設定とレベルを確認してみましょう。"
                    };
                }
            },
            {
                id: 4,
                title: "Level 4: 定数とEnumの活用",
                difficulty: "medium",
                description: `マジックナンバーや文字列リテラルを定数やEnumで管理しましょう。<br><br>
                <strong>課題:</strong> 証明書のステータスやしきい値を定数・Enumで定義してください。<br><br>
                <strong>ヒント:</strong> enum.Enum を使うと型安全な列挙型が作れます。`,
                code: `# 現在のマジックナンバー・文字列
if days_until_expiry <= 7:
    critical_certs.append(cert_info)
elif days_until_expiry <= 30:
    expiring_certs.append(cert_info)

if cert_type == 'AMAZON_ISSUED':
    # ...

# 定数とEnumで整理してください`,
                hints: [
                    "from enum import Enum をインポートします",
                    "class CertificateType(Enum): で列挙型を定義します",
                    "しきい値は CRITICAL_DAYS = 7 のような定数にします"
                ],
                solution: `from enum import Enum
from dataclasses import dataclass

# 定数
CRITICAL_EXPIRY_DAYS = 7
WARNING_EXPIRY_DAYS = 30
DEFAULT_REGION = 'us-east-1'

class CertificateType(Enum):
    """証明書タイプ"""
    AMAZON_ISSUED = "AMAZON_ISSUED"
    IMPORTED = "IMPORTED"

class CertificateStatus(Enum):
    """証明書ステータス"""
    ISSUED = "ISSUED"
    PENDING = "PENDING_VALIDATION"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class RenewalEligibility(Enum):
    """更新可否"""
    ELIGIBLE = "ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"

class ValidationMethod(Enum):
    """検証方法"""
    DNS = "DNS"
    EMAIL = "EMAIL"

@dataclass
class CertificateInfo:
    """証明書情報"""
    domain: str
    region: str
    service: str
    daysUntilExpiry: int
    cert_type: CertificateType
    status: CertificateStatus
    autoRenew: bool
    
    def is_expiring_soon(self) -> bool:
        """期限切れが近いかチェック"""
        return self.daysUntilExpiry <= WARNING_EXPIRY_DAYS
    
    def is_critical(self) -> bool:
        """緊急対応が必要かチェック"""
        return self.daysUntilExpiry <= CRITICAL_EXPIRY_DAYS
    
    def can_auto_renew(self) -> bool:
        """自動更新可能かチェック"""
        return self.cert_type == CertificateType.AMAZON_ISSUED

# 使用例
certificate_info = CertificateInfo(
    domain=cert_detail['DomainName'],
    region=DEFAULT_REGION,
    service=service,
    daysUntilExpiry=days_until_expiry,
    cert_type=CertificateType(cert_detail.get('Type')),
    status=CertificateStatus(cert_detail['Status']),
    autoRenew=cert_detail.get('Type') == CertificateType.AMAZON_ISSUED.value
)`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /from\s+enum\s+import\s+Enum/i, message: "Enumをインポートしています" },
                        { pattern: /class\s+\w+\(Enum\)/i, message: "Enumクラスを定義しています" },
                        { pattern: /[A-Z_]+\s*=\s*\d+/i, message: "定数を定義しています" },
                        { pattern: /CRITICAL|WARNING.*DAYS/i, message: "しきい値を定数化しています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 3,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 3 ? "完璧!コードの保守性が大幅に向上しました!" : "EnumとCONSTANTの使い方を確認しましょう。"
                    };
                }
            },
            {
                id: 5,
                title: "Level 5: 例外処理の強化",
                difficulty: "hard",
                description: `カスタム例外クラスを作成し、適切なエラーハンドリングを実装しましょう。<br><br>
                <strong>課題:</strong> 証明書管理用のカスタム例外クラスを作成し、具体的なエラー処理を実装してください。<br><br>
                <strong>ヒント:</strong> Exception を継承してカスタム例外を作ります。`,
                code: `# 現在の汎用的な例外処理
try:
    cert_detail = mock_client.describe_certificate(
        CertificateArn=cert_arn
    )
except Exception as e:
    print(f"エラー: {str(e)}")

# カスタム例外を使った実装に変更してください`,
                hints: [
                    "class CustomException(Exception): で独自例外を定義します",
                    "複数の例外クラスを用途別に作成します",
                    "except で具体的な例外タイプをキャッチします"
                ],
                solution: `from typing import Optional

class CertificateManagerError(Exception):
    """証明書マネージャーの基底例外"""
    pass

class CertificateNotFoundError(CertificateManagerError):
    """証明書が見つからない"""
    def __init__(self, certificate_arn: str):
        self.certificate_arn = certificate_arn
        super().__init__(f"Certificate not found: {certificate_arn}")

class CertificateExpiredError(CertificateManagerError):
    """証明書が期限切れ"""
    def __init__(self, domain: str, expired_days: int):
        self.domain = domain
        self.expired_days = expired_days
        super().__init__(f"Certificate for {domain} expired {expired_days} days ago")

class CertificateRenewalError(CertificateManagerError):
    """証明書の更新に失敗"""
    def __init__(self, domain: str, reason: str):
        self.domain = domain
        self.reason = reason
        super().__init__(f"Failed to renew certificate for {domain}: {reason}")

class AWSAPIError(CertificateManagerError):
    """AWS API呼び出しエラー"""
    def __init__(self, operation: str, error_code: str, message: str):
        self.operation = operation
        self.error_code = error_code
        super().__init__(f"AWS API error in {operation}: [{error_code}] {message}")

class MockACMClient:
    """ACMクライアントのモック"""
    
    def describe_certificate(self, CertificateArn: str) -> Dict[str, Any]:
        """証明書詳細を取得"""
        try:
            for cert in MOCK_CERTIFICATES:
                if cert['CertificateArn'] == CertificateArn:
                    return {'Certificate': cert}
            
            # 証明書が見つからない場合
            raise CertificateNotFoundError(CertificateArn)
            
        except KeyError as e:
            raise AWSAPIError('describe_certificate', 'InvalidParameter', str(e))
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            raise

def check_certificate_expiry(cert: CertificateInfo) -> None:
    """証明書の有効期限をチェック"""
    if cert.daysUntilExpiry < 0:
        raise CertificateExpiredError(cert.domain, abs(cert.daysUntilExpiry))
    
    if cert.is_critical():
        logger.critical(f"Certificate {cert.domain} expires in {cert.daysUntilExpiry} days!")
    elif cert.is_expiring_soon():
        logger.warning(f"Certificate {cert.domain} expires in {cert.daysUntilExpiry} days")

def renew_certificate(cert: CertificateInfo) -> bool:
    """証明書を更新"""
    try:
        if not cert.can_auto_renew():
            raise CertificateRenewalError(
                cert.domain, 
                "Certificate is not eligible for auto-renewal"
            )
        
        # 更新処理
        logger.info(f"Renewing certificate for {cert.domain}")
        return True
        
    except CertificateRenewalError as e:
        logger.error(f"Renewal failed: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during renewal: {e}", exc_info=True)
        raise

# 使用例
def main():
    try:
        client = MockACMClient('us-east-1')
        cert_detail = client.describe_certificate(cert_arn)
        
    except CertificateNotFoundError as e:
        logger.error(f"Certificate not found: {e.certificate_arn}")
    except AWSAPIError as e:
        logger.error(f"AWS API error: {e.error_code} - {e}")
    except CertificateManagerError as e:
        logger.error(f"Certificate manager error: {e}")
    except Exception as e:
        logger.critical(f"Unexpected error: {e}", exc_info=True)
        raise`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /class\s+\w+Error\(.*Exception/i, message: "カスタム例外クラスを定義しています" },
                        { pattern: /raise\s+\w+Error/i, message: "カスタム例外をraiseしています" },
                        { pattern: /except\s+\w+Error/i, message: "具体的な例外をキャッチしています" },
                        { pattern: /super\(\).__init__/i, message: "親クラスの初期化を呼んでいます" },
                        { pattern: /class.*Error.*:\s*def\s+__init__/s, message: "例外に追加情報を持たせています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 4,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 4 ? "素晴らしい!堅牢なエラーハンドリングが実装できました!" : "カスタム例外の定義と使用方法を確認しましょう。"
                    };
                }
            },
            {
                id: 6,
                title: "Level 6: デコレータの活用",
                difficulty: "hard",
                description: `リトライやキャッシュなどの共通処理をデコレータとして実装しましょう。<br><br>
                <strong>課題:</strong> AWS API呼び出しのリトライ機能をデコレータで実装してください。<br><br>
                <strong>ヒント:</strong> functools.wraps を使ってメタデータを保持します。`,
                code: `# 各関数で個別にリトライを実装
def get_certificate():
    for attempt in range(3):
        try:
            return client.describe_certificate(arn)
        except:
            if attempt < 2:
                time.sleep(2 ** attempt)
            else:
                raise

# デコレータで共通化してください`,
                hints: [
                    "def retry(max_attempts=3): でデコレータを定義します",
                    "functools.wraps でラッパー関数を修飾します",
                    "time.sleep() で指数バックオフを実装します"
                ],
                solution: `import time
import functools
from typing import Callable, TypeVar, Any

T = TypeVar('T')

def retry(
    max_attempts: int = 3,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """リトライデコレータ
    
    Args:
        max_attempts: 最大試行回数
        backoff_factor: バックオフの係数
        exceptions: キャッチする例外のタプル
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    logger.debug(f"Attempting {func.__name__} (try {attempt}/{max_attempts})")
                    return func(*args, **kwargs)
                    
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_attempts:
                        wait_time = backoff_factor ** (attempt - 1)
                        logger.warning(
                            f"{func.__name__} failed (attempt {attempt}/{max_attempts}): {e}. "
                            f"Retrying in {wait_time}s..."
                        )
                        time.sleep(wait_time)
                    else:
                        logger.error(
                            f"{func.__name__} failed after {max_attempts} attempts"
                        )
            
            raise last_exception
        
        return wrapper
    return decorator

def cache_result(ttl_seconds: int = 300):
    """結果をキャッシュするデコレータ
    
    Args:
        ttl_seconds: キャッシュの有効期間(秒)
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        cache = {}
        
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> T:
            # キャッシュキーを生成
            cache_key = (args, tuple(sorted(kwargs.items())))
            
            # キャッシュをチェック
            if cache_key in cache:
                cached_value, cached_time = cache[cache_key]
                if time.time() - cached_time < ttl_seconds:
                    logger.debug(f"Using cached result for {func.__name__}")
                    return cached_value
            
            # 関数を実行してキャッシュ
            result = func(*args, **kwargs)
            cache[cache_key] = (result, time.time())
            return result
        
        return wrapper
    return decorator

def log_execution_time(func: Callable[..., T]) -> Callable[..., T]:
    """実行時間をログ出力するデコレータ"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> T:
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            elapsed = time.time() - start_time
            logger.info(f"{func.__name__} completed in {elapsed:.2f}s")
            return result
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"{func.__name__} failed after {elapsed:.2f}s: {e}")
            raise
    
    return wrapper

# 使用例
class CertificateManager:
    
    @retry(max_attempts=3, exceptions=(AWSAPIError, ConnectionError))
    @log_execution_time
    def get_certificate(self, certificate_arn: str) -> CertificateInfo:
        """証明書情報を取得"""
        logger.info(f"Fetching certificate: {certificate_arn}")
        
        response = self.client.describe_certificate(
            CertificateArn=certificate_arn
        )
        
        return self._parse_certificate(response['Certificate'])
    
    @cache_result(ttl_seconds=300)
    @retry(max_attempts=3)
    @log_execution_time
    def list_all_certificates(self) -> List[CertificateInfo]:
        """すべての証明書を取得"""
        logger.info("Fetching all certificates")
        
        certificates = []
        paginator = self.client.get_paginator('list_certificates')
        
        for page in paginator.paginate():
            for cert_summary in page['CertificateSummaryList']:
                cert = self.get_certificate(cert_summary['CertificateArn'])
                certificates.append(cert)
        
        return certificates`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /def\s+retry.*:/i, message: "retryデコレータを定義しています" },
                        { pattern: /@functools\.wraps/i, message: "functools.wrapsを使用しています" },
                        { pattern: /def\s+decorator.*:\s*def\s+wrapper/s, message: "デコレータの構造が正しいです" },
                        { pattern: /time\.sleep/i, message: "リトライ時の待機を実装しています" },
                        { pattern: /@retry|@cache/i, message: "デコレータを実際に使用しています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 4,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 4 ? "完璧!再利用可能なデコレータが実装できました!" : "デコレータの構造とfunctools.wrapsを確認しましょう。"
                    };
                }
            },
            {
                id: 7,
                title: "Level 7: 非同期処理の実装",
                difficulty: "expert",
                description: `複数の証明書を並列で取得するため、asyncioを使った非同期処理を実装しましょう。<br><br>
                <strong>課題:</strong> async/awaitを使って証明書の並列取得を実装してください。<br><br>
                <strong>ヒント:</strong> asyncio.gather() で複数のタスクを並列実行できます。`,
                code: `# 現在の同期処理
def get_all_certificates():
    certificates = []
    for cert_arn in cert_arns:
        cert = get_certificate(cert_arn)
        certificates.append(cert)
    return certificates

# 非同期処理に変更してください`,
                hints: [
                    "async def で非同期関数を定義します",
                    "await でコルーチンの完了を待ちます",
                    "asyncio.gather() で複数のタスクを並列実行します"
                ],
                solution: `import asyncio
from typing import List, Optional
import aiohttp
from datetime import datetime

class AsyncCertificateManager:
    """非同期証明書マネージャー"""
    
    def __init__(self, region: str = 'us-east-1'):
        self.region = region
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """コンテキストマネージャーの開始"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """コンテキストマネージャーの終了"""
        if self.session:
            await self.session.close()
    
    @retry(max_attempts=3)
    @log_execution_time
    async def get_certificate_async(
        self, 
        certificate_arn: str
    ) -> CertificateInfo:
        """証明書情報を非同期で取得"""
        logger.debug(f"Fetching certificate: {certificate_arn}")
        
        # 非同期でAWS APIを呼び出し(モック)
        await asyncio.sleep(0.1)  # API呼び出しをシミュレート
        
        # 証明書詳細を取得
        cert_detail = await self._describe_certificate_async(certificate_arn)
        
        return self._parse_certificate(cert_detail)
    
    async def _describe_certificate_async(
        self, 
        certificate_arn: str
    ) -> dict:
        """証明書詳細を非同期で取得(モック)"""
        # 実際のaioboto3を使う場合:
        # async with aioboto3.Session().client('acm', region_name=self.region) as client:
        #     response = await client.describe_certificate(CertificateArn=certificate_arn)
        #     return response['Certificate']
        
        for cert in MOCK_CERTIFICATES:
            if cert['CertificateArn'] == certificate_arn:
                return cert
        
        raise CertificateNotFoundError(certificate_arn)
    
    async def list_all_certificates_async(self) -> List[CertificateInfo]:
        """すべての証明書を非同期で並列取得"""
        logger.info("Fetching all certificates (async)")
        
        # 証明書ARNのリストを取得
        cert_arns = [cert['CertificateArn'] for cert in MOCK_CERTIFICATES]
        
        # 並列でタスクを実行
        tasks = [
            self.get_certificate_async(arn) 
            for arn in cert_arns
        ]
        
        # すべてのタスクが完了するまで待機
        certificates = await asyncio.gather(*tasks, return_exceptions=True)
        
        # エラーをフィルタリング
        valid_certs = []
        for cert in certificates:
            if isinstance(cert, Exception):
                logger.error(f"Failed to fetch certificate: {cert}")
            else:
                valid_certs.append(cert)
        
        return valid_certs
    
    async def check_certificates_parallel(
        self, 
        certificate_arns: List[str],
        max_concurrent: int = 10
    ) -> List[CertificateInfo]:
        """証明書を並列チェック(同時実行数制限付き)"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def bounded_fetch(arn: str) -> Optional[CertificateInfo]:
            async with semaphore:
                try:
                    return await self.get_certificate_async(arn)
                except Exception as e:
                    logger.error(f"Error fetching {arn}: {e}")
                    return None
        
        tasks = [bounded_fetch(arn) for arn in certificate_arns]
        results = await asyncio.gather(*tasks)
        
        return [cert for cert in results if cert is not None]
    
    def _parse_certificate(self, cert_detail: dict) -> CertificateInfo:
        """証明書詳細をパース"""
        expiry_date = cert_detail.get('NotAfter')
        if expiry_date:
            days_until_expiry = (expiry_date - datetime.now()).days
        else:
            days_until_expiry = 0
        
        # サービス判定
        service = self._determine_service(cert_detail.get('InUseBy', []))
        
        return CertificateInfo(
            domain=cert_detail['DomainName'],
            region=self.region,
            service=service,
            daysUntilExpiry=days_until_expiry,
            cert_type=CertificateType(cert_detail.get('Type')),
            status=CertificateStatus(cert_detail['Status']),
            autoRenew=cert_detail.get('Type') == CertificateType.AMAZON_ISSUED.value
        )
    
    def _determine_service(self, in_use_by: List[str]) -> str:
        """使用中のサービスを判定"""
        if not in_use_by:
            return 'Unknown'
        
        resource_arn = in_use_by[0].lower()
        
        if 'cloudfront' in resource_arn:
            return 'CloudFront'
        elif 'elasticloadbalancing' in resource_arn:
            return 'ALB' if 'app/' in resource_arn else 'ELB'
        elif 'apigateway' in resource_arn:
            return 'API Gateway'
        else:
            return 'Unknown'

# 使用例
async def main():
    """メイン処理"""
    start_time = time.time()
    
    async with AsyncCertificateManager() as manager:
        # 並列で全証明書を取得
        certificates = await manager.list_all_certificates_async()
        
        logger.info(f"Retrieved {len(certificates)} certificates")
        
        # 期限切れチェック
        critical = [c for c in certificates if c.is_critical()]
        expiring = [c for c in certificates if c.is_expiring_soon() and not c.is_critical()]
        
        if critical:
            logger.critical(f"🚨 {len(critical)} certificates expiring in 7 days")
        if expiring:
            logger.warning(f"⚠️ {len(expiring)} certificates expiring in 30 days")
    
    elapsed = time.time() - start_time
    logger.info(f"Total execution time: {elapsed:.2f}s")

# 実行
if __name__ == "__main__":
    asyncio.run(main())`,
                checkAnswer: function(answer) {
                    const checks = [
                        { pattern: /async\s+def/i, message: "async関数を定義しています" },
                        { pattern: /await/i, message: "awaitでコルーチンを待機しています" },
                        { pattern: /asyncio\.gather/i, message: "asyncio.gatherで並列実行しています" },
                        { pattern: /asyncio\.Semaphore|semaphore/i, message: "同時実行数を制限しています" },
                        { pattern: /async\s+with|__aenter__|__aexit__/i, message: "非同期コンテキストマネージャーを実装しています" },
                        { pattern: /asyncio\.run/i, message: "asyncio.runでメイン関数を実行しています" }
                    ];
                    let score = 0;
                    let feedback = [];
                    
                    checks.forEach(check => {
                        if (check.pattern.test(answer)) {
                            score++;
                            feedback.push("✓ " + check.message);
                        }
                    });
                    
                    return {
                        passed: score >= 5,
                        score: score,
                        feedback: feedback.join("<br>"),
                        message: score >= 5 ? 
                            "🎉 完璧です!本格的な非同期処理が実装できました!パフォーマンスが大幅に向上しました!" : 
                            "async/await、asyncio.gather、Semaphoreの使い方を確認しましょう。"
                    };
                }
            }
        ];

        let currentLevel = 0;
        let stats = {
            solved: 0,
            hints: 0,
            attempts: 0
        };

        function init() {
            renderLevelSelector();
            loadPuzzle(0);
            updateStats();
        }

        function renderLevelSelector() {
            const selector = document.getElementById('levelSelector');
            puzzles.forEach((puzzle, index) => {
                const btn = document.createElement('button');
                btn.className = 'level-btn';
                btn.textContent = `Level ${puzzle.id}`;
                btn.onclick = () => loadPuzzle(index);
                if (index > 0) btn.disabled = true;
                btn.id = `level-btn-${index}`;
                selector.appendChild(btn);
            });
        }

        function loadPuzzle(index) {
            currentLevel = index;
            const puzzle = puzzles[index];
            
            document.querySelectorAll('.level-btn').forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });
            
            const container = document.getElementById('puzzleContainer');
            container.innerHTML = `
                <div class="puzzle active">
                    <h2 class="puzzle-title">
                        ${puzzle.title}
                        <span class="difficulty ${puzzle.difficulty}">
                            ${puzzle.difficulty === 'easy' ? '初級' : 
                              puzzle.difficulty === 'medium' ? '中級' : 
                              puzzle.difficulty === 'hard' ? '上級' : 'エキスパート'}
                        </span>
                    </h2>
                    <div class="puzzle-description">${puzzle.description}</div>
                    <div class="code-block">${escapeHtml(puzzle.code)}</div>
                    <div class="answer-area">
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #475569;">
                            💡 あなたの解答:
                        </label>
                        <textarea id="answer" placeholder="ここにPythonコードを記述してください..."></textarea>
                    </div>
                    <div class="button-group">
                        <button class="submit-btn" onclick="checkAnswer()">✓ 解答を確認</button>
                        <button class="hint-btn" onclick="showHint()">💡 ヒント</button>
                        <button class="reset-btn" onclick="resetAnswer()">↺ リセット</button>
                    </div>
                    <div class="feedback" id="feedback"></div>
                </div>
            `;
            
            updateProgress();
            hintLevel = 0;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function checkAnswer() {
            const answer = document.getElementById('answer').value.trim();
            const feedback = document.getElementById('feedback');
            const puzzle = puzzles[currentLevel];
            
            stats.attempts++;
            updateStats();
            
            if (!answer) {
                feedback.className = 'feedback error show';
                feedback.innerHTML = '<strong>❌ エラー</strong><br>解答を入力してください。';
                return;
            }
            
            const result = puzzle.checkAnswer(answer);
            
            if (result.passed) {
                feedback.className = 'feedback success show';
                feedback.innerHTML = `
                    <strong>✅ 正解!</strong><br>
                    ${result.feedback}<br><br>
                    ${result.message}
                `;
                
                stats.solved++;
                updateStats();
                
                const btn = document.getElementById(`level-btn-${currentLevel}`);
                btn.classList.add('completed');
                
                if (currentLevel < puzzles.length - 1) {
                    const nextBtn = document.getElementById(`level-btn-${currentLevel + 1}`);
                    nextBtn.disabled = false;
                    
                    setTimeout(() => {
                        showCelebration();
                    }, 500);
                } else {
                    setTimeout(() => {
                        showFinalCelebration();
                    }, 500);
                }
            } else {
                feedback.className = 'feedback error show';
                feedback.innerHTML = `
                    <strong>❌ もう一度挑戦!</strong><br>
                    ${result.feedback ? result.feedback + '<br><br>' : ''}
                    ${result.message}
                `;
            }
        }

        let hintLevel = 0;

        function showHint() {
            const puzzle = puzzles[currentLevel];
            const feedback = document.getElementById('feedback');
            
            if (hintLevel >= puzzle.hints.length) {
                feedback.className = 'feedback hint show';
                feedback.innerHTML = '<strong>💡 すべてのヒント</strong><br>' + 
                    puzzle.hints.map((h, i) => `${i + 1}. ${h}`).join('<br>');
                return;
            }
            
            stats.hints++;
            updateStats();
            
            feedback.className = 'feedback hint show';
            feedback.innerHTML = `<strong>💡 ヒント ${hintLevel + 1}</strong><br>${puzzle.hints[hintLevel]}`;
            hintLevel++;
        }

        function resetAnswer() {
            document.getElementById('answer').value = '';
            document.getElementById('feedback').className = 'feedback';
            hintLevel = 0;
        }

        function showCelebration() {
            const overlay = document.getElementById('overlay');
            const celebration = document.getElementById('celebration');
            const message = document.getElementById('celebrationMessage');
            
            message.textContent = `Level ${puzzles[currentLevel].id} クリア!次のレベルに挑戦しましょう!`;
            
            overlay.classList.add('show');
            celebration.classList.add('show');
        }

        function showFinalCelebration() {
            const overlay = document.getElementById('overlay');
            const celebration = document.getElementById('celebration');
            const message = document.getElementById('celebrationMessage');
            
            message.innerHTML = `
                全${puzzles.length}レベルクリア!おめでとうございます!🎊<br><br>
                <small>プロダクションレベルのPythonコードが書けるようになりました!</small>
            `;
            
            celebration.querySelector('button').textContent = '完了';
            celebration.querySelector('button').onclick = closeCelebration;
            
            overlay.classList.add('show');
            celebration.classList.add('show');
        }

        function closeCelebration() {
            const overlay = document.getElementById('overlay');
            const celebration = document.getElementById('celebration');
            
            overlay.classList.remove('show');
            celebration.classList.remove('show');
            
            if (currentLevel < puzzles.length - 1) {
                loadPuzzle(currentLevel + 1);
            }
        }

        function updateStats() {
            document.getElementById('solvedCount').textContent = stats.solved;
            document.getElementById('hintsUsed').textContent = stats.hints;
            document.getElementById('attempts').textContent = stats.attempts;
        }

        function updateProgress() {
            const progress = (stats.solved / puzzles.length) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }

        init();
    </script>
</body>
</html>
