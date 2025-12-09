"""
AWS Lambda Function for ElastiCache Monitoring
ElastiCacheのメトリクスを監視し、閾値を超えた場合にSlack/Teamsに通知
"""

import json
import boto3
import os
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# 環境変数
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL', '')
TEAMS_WEBHOOK_URL = os.environ.get('TEAMS_WEBHOOK_URL', '')
CLUSTER_ID = os.environ.get('CLUSTER_ID', '')
AWS_REGION = os.environ.get('AWS_REGION', 'ap-northeast-1')

# 閾値設定
THRESHOLDS = {
    'cpu_utilization': 70,          # CPU使用率 (%)
    'memory_usage': 80,              # メモリ使用率 (%)
    'cache_hit_rate': 70,            # キャッシュヒット率 (%) - これ以下で警告
    'evictions': 100,                # エビクション数
    'connections': 100,              # 接続数
    'response_time': 5               # レスポンスタイム (ms)
}

# CloudWatchクライアント
cloudwatch = boto3.client('cloudwatch', region_name=AWS_REGION)
elasticache = boto3.client('elasticache', region_name=AWS_REGION)


def get_metric_statistics(namespace, metric_name, dimensions, statistic='Average'):
    """CloudWatchからメトリクスを取得"""
    try:
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=5)
        
        response = cloudwatch.get_metric_statistics(
            Namespace=namespace,
            MetricName=metric_name,
            Dimensions=dimensions,
            StartTime=start_time,
            EndTime=end_time,
            Period=300,
            Statistics=[statistic]
        )
        
        if response['Datapoints']:
            return response['Datapoints'][0][statistic]
        return None
    except Exception as e:
        print(f"Error getting metric {metric_name}: {str(e)}")
        return None


def get_elasticache_metrics(cluster_id):
    """ElastiCacheのメトリクスを取得"""
    dimensions = [{'Name': 'CacheClusterId', 'Value': cluster_id}]
    
    metrics = {
        'cpu_utilization': get_metric_statistics(
            'AWS/ElastiCache', 'CPUUtilization', dimensions
        ),
        'memory_usage': get_metric_statistics(
            'AWS/ElastiCache', 'DatabaseMemoryUsagePercentage', dimensions
        ),
        'cache_hits': get_metric_statistics(
            'AWS/ElastiCache', 'CacheHits', dimensions, 'Sum'
        ),
        'cache_misses': get_metric_statistics(
            'AWS/ElastiCache', 'CacheMisses', dimensions, 'Sum'
        ),
        'evictions': get_metric_statistics(
            'AWS/ElastiCache', 'Evictions', dimensions, 'Sum'
        ),
        'curr_connections': get_metric_statistics(
            'AWS/ElastiCache', 'CurrConnections', dimensions
        ),
        'network_bytes_in': get_metric_statistics(
            'AWS/ElastiCache', 'NetworkBytesIn', dimensions, 'Sum'
        ),
        'network_bytes_out': get_metric_statistics(
            'AWS/ElastiCache', 'NetworkBytesOut', dimensions, 'Sum'
        )
    }
    
    # キャッシュヒット率を計算
    if metrics['cache_hits'] is not None and metrics['cache_misses'] is not None:
        total = metrics['cache_hits'] + metrics['cache_misses']
        if total > 0:
            metrics['cache_hit_rate'] = (metrics['cache_hits'] / total) * 100
        else:
            metrics['cache_hit_rate'] = 0
    else:
        metrics['cache_hit_rate'] = None
    
    return metrics


def check_thresholds(metrics):
    """閾値チェックとアラート生成"""
    alerts = []
    
    # CPU使用率チェック
    if metrics['cpu_utilization'] and metrics['cpu_utilization'] > THRESHOLDS['cpu_utilization']:
        alerts.append({
            'level': 'warning',
            'metric': 'CPU使用率',
            'value': f"{metrics['cpu_utilization']:.1f}%",
            'threshold': f"{THRESHOLDS['cpu_utilization']}%",
            'message': 'CPU使用率が高くなっています'
        })
    
    # メモリ使用率チェック
    if metrics['memory_usage'] and metrics['memory_usage'] > THRESHOLDS['memory_usage']:
        alerts.append({
            'level': 'critical',
            'metric': 'メモリ使用率',
            'value': f"{metrics['memory_usage']:.1f}%",
            'threshold': f"{THRESHOLDS['memory_usage']}%",
            'message': 'メモリ使用率が高くなっています'
        })
    
    # キャッシュヒット率チェック
    if metrics['cache_hit_rate'] and metrics['cache_hit_rate'] < THRESHOLDS['cache_hit_rate']:
        alerts.append({
            'level': 'warning',
            'metric': 'キャッシュヒット率',
            'value': f"{metrics['cache_hit_rate']:.1f}%",
            'threshold': f"{THRESHOLDS['cache_hit_rate']}%",
            'message': 'キャッシュヒット率が低下しています'
        })
    
    # エビクション数チェック
    if metrics['evictions'] and metrics['evictions'] > THRESHOLDS['evictions']:
        alerts.append({
            'level': 'warning',
            'metric': 'エビクション数',
            'value': f"{metrics['evictions']:.0f}",
            'threshold': f"{THRESHOLDS['evictions']}",
            'message': 'エビクションが頻発しています'
        })
    
    # 接続数チェック
    if metrics['curr_connections'] and metrics['curr_connections'] > THRESHOLDS['connections']:
        alerts.append({
            'level': 'info',
            'metric': '接続数',
            'value': f"{metrics['curr_connections']:.0f}",
            'threshold': f"{THRESHOLDS['connections']}",
            'message': '接続数が増加しています'
        })
    
    return alerts


def create_slack_message(cluster_id, alerts, metrics):
    """Slack用のメッセージを作成"""
    color_map = {
        'critical': '#dc2626',  # 赤
        'warning': '#f59e0b',   # オレンジ
        'info': '#3b82f6'       # 青
    }
    
    attachments = []
    
    for alert in alerts:
        attachment = {
            'color': color_map.get(alert['level'], '#6b7280'),
            'title': f"🚨 {alert['metric']} アラート",
            'text': alert['message'],
            'fields': [
                {
                    'title': '現在値',
                    'value': alert['value'],
                    'short': True
                },
                {
                    'title': '閾値',
                    'value': alert['threshold'],
                    'short': True
                }
            ],
            'footer': f"ElastiCache: {cluster_id}",
            'ts': int(datetime.now().timestamp())
        }
        attachments.append(attachment)
    
    # サマリー情報を追加
    summary = {
        'color': '#10b981',
        'title': '📊 現在のメトリクスサマリー',
        'fields': [
            {
                'title': 'CPU使用率',
                'value': f"{metrics['cpu_utilization']:.1f}%" if metrics['cpu_utilization'] else 'N/A',
                'short': True
            },
            {
                'title': 'メモリ使用率',
                'value': f"{metrics['memory_usage']:.1f}%" if metrics['memory_usage'] else 'N/A',
                'short': True
            },
            {
                'title': 'キャッシュヒット率',
                'value': f"{metrics['cache_hit_rate']:.1f}%" if metrics['cache_hit_rate'] else 'N/A',
                'short': True
            },
            {
                'title': '接続数',
                'value': f"{metrics['curr_connections']:.0f}" if metrics['curr_connections'] else 'N/A',
                'short': True
            }
        ],
        'footer': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')
    }
    attachments.append(summary)
    
    message = {
        'text': f'*ElastiCache監視アラート* - {cluster_id}',
        'attachments': attachments
    }
    
    return message


def create_teams_message(cluster_id, alerts, metrics):
    """Microsoft Teams用のメッセージを作成"""
    color_map = {
        'critical': 'attention',
        'warning': 'warning',
        'info': 'good'
    }
    
    facts = []
    
    for alert in alerts:
        facts.append({
            'name': f"{alert['metric']}",
            'value': f"{alert['message']} (現在値: {alert['value']}, 閾値: {alert['threshold']})"
        })
    
    # メトリクスサマリー
    facts.append({'name': '---', 'value': '**現在のメトリクス**'})
    facts.append({
        'name': 'CPU使用率',
        'value': f"{metrics['cpu_utilization']:.1f}%" if metrics['cpu_utilization'] else 'N/A'
    })
    facts.append({
        'name': 'メモリ使用率',
        'value': f"{metrics['memory_usage']:.1f}%" if metrics['memory_usage'] else 'N/A'
    })
    facts.append({
        'name': 'キャッシュヒット率',
        'value': f"{metrics['cache_hit_rate']:.1f}%" if metrics['cache_hit_rate'] else 'N/A'
    })
    facts.append({
        'name': '接続数',
        'value': f"{metrics['curr_connections']:.0f}" if metrics['curr_connections'] else 'N/A'
    })
    
    # 最も深刻なアラートレベルを取得
    severity_order = {'critical': 0, 'warning': 1, 'info': 2}
    highest_severity = min(alerts, key=lambda x: severity_order.get(x['level'], 3))['level'] if alerts else 'info'
    
    message = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        'summary': f'ElastiCache監視アラート - {cluster_id}',
        'themeColor': '0076D7',
        'title': f'🚨 ElastiCache監視アラート',
        'sections': [
            {
                'activityTitle': f'クラスター: {cluster_id}',
                'activitySubtitle': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
                'facts': facts
            }
        ]
    }
    
    return message


def send_to_slack(message):
    """Slackに通知を送信"""
    if not SLACK_WEBHOOK_URL:
        print("Slack Webhook URL is not configured")
        return False
    
    try:
        req = Request(
            SLACK_WEBHOOK_URL,
            data=json.dumps(message).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        response = urlopen(req)
        return response.getcode() == 200
    except HTTPError as e:
        print(f"Slack notification failed: {e.code} - {e.reason}")
        return False
    except URLError as e:
        print(f"Slack notification failed: {e.reason}")
        return False


def send_to_teams(message):
    """Microsoft Teamsに通知を送信"""
    if not TEAMS_WEBHOOK_URL:
        print("Teams Webhook URL is not configured")
        return False
    
    try:
        req = Request(
            TEAMS_WEBHOOK_URL,
            data=json.dumps(message).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        response = urlopen(req)
        return response.getcode() == 200
    except HTTPError as e:
        print(f"Teams notification failed: {e.code} - {e.reason}")
        return False
    except URLError as e:
        print(f"Teams notification failed: {e.reason}")
        return False


def lambda_handler(event, context):
    """Lambda関数のメインハンドラー"""
    
    # CloudWatch Alarmからのトリガーの場合
    if 'Records' in event and event['Records']:
        # SNS経由でのトリガー
        for record in event['Records']:
            if 'Sns' in record:
                sns_message = json.loads(record['Sns']['Message'])
                cluster_id = sns_message.get('Trigger', {}).get('Dimensions', [{}])[0].get('value', CLUSTER_ID)
    else:
        cluster_id = CLUSTER_ID
    
    if not cluster_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Cluster ID is not specified'})
        }
    
    print(f"Monitoring ElastiCache cluster: {cluster_id}")
    
    # メトリクスを取得
    metrics = get_elasticache_metrics(cluster_id)
    
    # 閾値チェック
    alerts = check_thresholds(metrics)
    
    if not alerts:
        print("No alerts triggered")
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'No alerts',
                'metrics': {k: v for k, v in metrics.items() if v is not None}
            })
        }
    
    print(f"Alerts triggered: {len(alerts)}")
    
    # 通知を送信
    slack_sent = False
    teams_sent = False
    
    if SLACK_WEBHOOK_URL:
        slack_message = create_slack_message(cluster_id, alerts, metrics)
        slack_sent = send_to_slack(slack_message)
        print(f"Slack notification sent: {slack_sent}")
    
    if TEAMS_WEBHOOK_URL:
        teams_message = create_teams_message(cluster_id, alerts, metrics)
        teams_sent = send_to_teams(teams_message)
        print(f"Teams notification sent: {teams_sent}")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Alerts processed',
            'alerts_count': len(alerts),
            'notifications': {
                'slack': slack_sent,
                'teams': teams_sent
            },
            'alerts': alerts
        })
    }
