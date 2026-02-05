# Kubernetes ハンズオン教材

実践的なシナリオに基づいた5つのユースケースを通じて、Kubernetesの基本操作を学びます。

-----

## ユースケース1: Webアプリケーションのデプロイと公開

### シナリオ

あなたはスタートアップ企業のインフラエンジニアです。開発チームが作成したWebアプリケーションをKubernetesクラスタにデプロイし、外部からアクセスできるようにしてください。

### 要件

- Nginxベースのフロントエンドアプリを3レプリカでデプロイ
- ClusterIP Serviceで内部通信を確立
- Ingressを使用して外部公開
- リソース制限を適切に設定

### ハンズオン手順

#### Step 1: Namespaceの作成

```bash
kubectl create namespace webapp-handson
kubectl config set-context --current --namespace=webapp-handson
```

#### Step 2: Deploymentの作成

```yaml
# webapp-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: webapp-handson
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
      tier: web
  template:
    metadata:
      labels:
        app: frontend
        tier: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 3
```

```bash
kubectl apply -f webapp-deployment.yaml
```

#### Step 3: Serviceの作成

```yaml
# webapp-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: webapp-handson
spec:
  selector:
    app: frontend
    tier: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

```bash
kubectl apply -f webapp-service.yaml
```

#### Step 4: Ingressの作成

```yaml
# webapp-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  namespace: webapp-handson
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: webapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

```bash
kubectl apply -f webapp-ingress.yaml
```

### 確認コマンド

```bash
# デプロイ状況の確認
kubectl get all -n webapp-handson

# Podの詳細確認
kubectl describe pods -n webapp-handson

# ローカルでの動作確認
kubectl port-forward svc/frontend-service 8080:80 -n webapp-handson
# ブラウザで http://localhost:8080 にアクセス
```

### チャレンジ課題

1. レプリカ数を5に変更してみましょう
1. Podのログを確認してみましょう
1. 1つのPodを手動で削除し、自動復旧を確認しましょう

-----

## ユースケース2: 環境変数と設定管理

### シナリオ

本番環境とステージング環境で異なる設定を使用するアプリケーションをデプロイします。ConfigMapとSecretを活用して、環境ごとの設定を管理してください。

### 要件

- データベース接続情報をSecretで管理
- アプリケーション設定をConfigMapで管理
- 環境変数としてコンテナに注入

### ハンズオン手順

#### Step 1: Namespaceの作成

```bash
kubectl create namespace config-handson
```

#### Step 2: ConfigMapの作成

```yaml
# app-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: config-handson
data:
  # 単一の値
  LOG_LEVEL: "info"
  APP_ENV: "staging"
  MAX_CONNECTIONS: "100"
  
  # 設定ファイル全体
  app.properties: |
    server.port=8080
    server.timeout=30
    feature.newUI=true
    feature.darkMode=false
```

```bash
kubectl apply -f app-configmap.yaml
```

#### Step 3: Secretの作成

```bash
# コマンドラインから作成
kubectl create secret generic db-credentials \
  --from-literal=DB_HOST=mysql.example.com \
  --from-literal=DB_USER=appuser \
  --from-literal=DB_PASSWORD=S3cur3P@ssw0rd \
  -n config-handson
```

または YAML で作成（値はbase64エンコード）：

```yaml
# db-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: config-handson
type: Opaque
data:
  DB_HOST: bXlzcWwuZXhhbXBsZS5jb20=
  DB_USER: YXBwdXNlcg==
  DB_PASSWORD: UzNjdXIzUEBzc3cwcmQ=
```

#### Step 4: ConfigMapとSecretを使用するDeployment

```yaml
# app-with-config.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configured-app
  namespace: config-handson
spec:
  replicas: 2
  selector:
    matchLabels:
      app: configured-app
  template:
    metadata:
      labels:
        app: configured-app
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ['sh', '-c', 'echo "Config loaded" && env | grep -E "(DB_|LOG_|APP_)" && sleep 3600']
        
        # ConfigMapから環境変数を個別に設定
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_ENV
        
        # Secretから環境変数を設定
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: DB_HOST
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: DB_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: DB_PASSWORD
        
        # ConfigMapをボリュームとしてマウント
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
          readOnly: true
      
      volumes:
      - name: config-volume
        configMap:
          name: app-config
```

```bash
kubectl apply -f app-with-config.yaml
```

### 確認コマンド

```bash
# ConfigMapの内容確認
kubectl get configmap app-config -n config-handson -o yaml

# Secretの内容確認（base64デコード）
kubectl get secret db-credentials -n config-handson -o jsonpath='{.data.DB_PASSWORD}' | base64 -d

# Pod内の環境変数を確認
kubectl exec -it deployment/configured-app -n config-handson -- env | grep -E "(DB_|LOG_|APP_)"

# マウントされた設定ファイルを確認
kubectl exec -it deployment/configured-app -n config-handson -- cat /etc/config/app.properties
```

### チャレンジ課題

1. ConfigMapの値を変更し、Podを再起動して反映を確認しましょう
1. `envFrom`を使用してConfigMap全体を環境変数として読み込んでみましょう
1. Secretの値をファイルとしてマウントしてみましょう

-----

## ユースケース3: ステートフルアプリケーションとストレージ

### シナリオ

データを永続化する必要があるMySQLデータベースをKubernetesにデプロイします。Podが再起動してもデータが失われないように、PersistentVolumeを使用してください。

### 要件

- MySQLをStatefulSetでデプロイ
- PersistentVolumeClaimでデータを永続化
- 初期化用のConfigMapを作成
- Headless Serviceで安定したネットワーク識別子を提供

### ハンズオン手順

#### Step 1: Namespaceの作成

```bash
kubectl create namespace database-handson
```

#### Step 2: Secretの作成（パスワード管理）

```bash
kubectl create secret generic mysql-secret \
  --from-literal=MYSQL_ROOT_PASSWORD=rootpass123 \
  --from-literal=MYSQL_DATABASE=appdb \
  --from-literal=MYSQL_USER=appuser \
  --from-literal=MYSQL_PASSWORD=apppass123 \
  -n database-handson
```

#### Step 3: ConfigMapの作成（初期化SQL）

```yaml
# mysql-initdb-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-initdb
  namespace: database-handson
data:
  init.sql: |
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    INSERT INTO users (name, email) VALUES 
      ('Alice', 'alice@example.com'),
      ('Bob', 'bob@example.com');
```

```bash
kubectl apply -f mysql-initdb-configmap.yaml
```

#### Step 4: Headless Serviceの作成

```yaml
# mysql-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: database-handson
spec:
  ports:
  - port: 3306
    targetPort: 3306
  clusterIP: None  # Headless Service
  selector:
    app: mysql
```

```bash
kubectl apply -f mysql-service.yaml
```

#### Step 5: StatefulSetの作成

```yaml
# mysql-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: database-handson
spec:
  serviceName: mysql
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        envFrom:
        - secretRef:
            name: mysql-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
        - name: initdb
          mountPath: /docker-entrypoint-initdb.d
        livenessProbe:
          exec:
            command:
            - mysqladmin
            - ping
            - -h
            - localhost
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - mysql
            - -h
            - localhost
            - -u
            - root
            - -prootpass123
            - -e
            - "SELECT 1"
          initialDelaySeconds: 10
          periodSeconds: 5
      volumes:
      - name: initdb
        configMap:
          name: mysql-initdb
  
  volumeClaimTemplates:
  - metadata:
      name: mysql-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi
```

```bash
kubectl apply -f mysql-statefulset.yaml
```

### 確認コマンド

```bash
# StatefulSetの状態確認
kubectl get statefulset -n database-handson

# PVCの確認
kubectl get pvc -n database-handson

# MySQLへの接続テスト
kubectl exec -it mysql-0 -n database-handson -- mysql -u root -prootpass123 -e "SHOW DATABASES;"

# 初期データの確認
kubectl exec -it mysql-0 -n database-handson -- mysql -u root -prootpass123 appdb -e "SELECT * FROM users;"
```

### 永続性のテスト

```bash
# データを追加
kubectl exec -it mysql-0 -n database-handson -- mysql -u root -prootpass123 appdb \
  -e "INSERT INTO users (name, email) VALUES ('Charlie', 'charlie@example.com');"

# Podを削除
kubectl delete pod mysql-0 -n database-handson

# Pod再作成後にデータを確認
kubectl exec -it mysql-0 -n database-handson -- mysql -u root -prootpass123 appdb \
  -e "SELECT * FROM users;"
```

### チャレンジ課題

1. StorageClassを指定してPVCを作成してみましょう
1. MySQLのレプリカを増やしてレプリケーションを構成してみましょう
1. バックアップ用のCronJobを作成してみましょう

-----

## ユースケース4: マイクロサービスアーキテクチャ

### シナリオ

ECサイトのバックエンドをマイクロサービスとして構築します。フロントエンド、商品サービス、注文サービスの3つのサービスが連携するシステムをデプロイしてください。

### 要件

- 3つのマイクロサービスをそれぞれDeploymentでデプロイ
- 各サービス間はService経由で通信
- 外部へはIngressで公開
- サービスディスカバリを活用

### ハンズオン手順

#### Step 1: Namespaceの作成

```bash
kubectl create namespace microservices-handson
```

#### Step 2: 商品サービス（Products Service）

```yaml
# products-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: products-api
  namespace: microservices-handson
spec:
  replicas: 2
  selector:
    matchLabels:
      app: products-api
      tier: backend
  template:
    metadata:
      labels:
        app: products-api
        tier: backend
    spec:
      containers:
      - name: products
        image: hashicorp/http-echo
        args:
        - "-text={\"service\":\"products\",\"items\":[{\"id\":1,\"name\":\"Laptop\",\"price\":999},{\"id\":2,\"name\":\"Mouse\",\"price\":29}]}"
        - "-listen=:8080"
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "32Mi"
            cpu: "50m"
          limits:
            memory: "64Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: products-api
  namespace: microservices-handson
spec:
  selector:
    app: products-api
  ports:
  - port: 80
    targetPort: 8080
```

```bash
kubectl apply -f products-service.yaml
```

#### Step 3: 注文サービス（Orders Service）

```yaml
# orders-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
  namespace: microservices-handson
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orders-api
      tier: backend
  template:
    metadata:
      labels:
        app: orders-api
        tier: backend
    spec:
      containers:
      - name: orders
        image: hashicorp/http-echo
        args:
        - "-text={\"service\":\"orders\",\"orders\":[{\"id\":1001,\"product_id\":1,\"quantity\":1},{\"id\":1002,\"product_id\":2,\"quantity\":3}]}"
        - "-listen=:8080"
        ports:
        - containerPort: 8080
        env:
        - name: PRODUCTS_SERVICE_URL
          value: "http://products-api.microservices-handson.svc.cluster.local"
        resources:
          requests:
            memory: "32Mi"
            cpu: "50m"
          limits:
            memory: "64Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: orders-api
  namespace: microservices-handson
spec:
  selector:
    app: orders-api
  ports:
  - port: 80
    targetPort: 8080
```

```bash
kubectl apply -f orders-service.yaml
```

#### Step 4: フロントエンドサービス

```yaml
# frontend-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: microservices-handson
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
      tier: frontend
  template:
    metadata:
      labels:
        app: frontend
        tier: frontend
    spec:
      containers:
      - name: frontend
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        env:
        - name: PRODUCTS_API_URL
          value: "http://products-api"
        - name: ORDERS_API_URL
          value: "http://orders-api"
        resources:
          requests:
            memory: "32Mi"
            cpu: "50m"
          limits:
            memory: "64Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: microservices-handson
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
```

```bash
kubectl apply -f frontend-service.yaml
```

#### Step 5: Ingressの設定

```yaml
# microservices-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservices-ingress
  namespace: microservices-handson
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  ingressClassName: nginx
  rules:
  - host: shop.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api/products(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: products-api
            port:
              number: 80
      - path: /api/orders(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: orders-api
            port:
              number: 80
```

```bash
kubectl apply -f microservices-ingress.yaml
```

### 確認コマンド

```bash
# 全サービスの状態確認
kubectl get all -n microservices-handson

# サービス間通信のテスト（Pod内から他サービスにアクセス）
kubectl exec -it deployment/frontend -n microservices-handson -- \
  wget -qO- http://products-api/

kubectl exec -it deployment/frontend -n microservices-handson -- \
  wget -qO- http://orders-api/

# DNS名の解決確認
kubectl exec -it deployment/frontend -n microservices-handson -- \
  nslookup products-api

# ポートフォワードでの確認
kubectl port-forward svc/products-api 8081:80 -n microservices-handson &
kubectl port-forward svc/orders-api 8082:80 -n microservices-handson &
kubectl port-forward svc/frontend 8080:80 -n microservices-handson &
```

### チャレンジ課題

1. NetworkPolicyを作成して、frontendからのみbackendにアクセスできるよう制限してみましょう
1. HorizontalPodAutoscalerを設定してみましょう
1. サービスメッシュ（Istio/Linkerd）の導入を検討してみましょう

-----

## ユースケース5: 本番運用を見据えた監視とスケーリング

### シナリオ

本番環境で運用するアプリケーションに対して、適切な監視設定とオートスケーリングを構成します。リソース使用状況に応じて自動的にスケールする仕組みを構築してください。

### 要件

- 適切なリソース制限の設定
- HorizontalPodAutoscalerの設定
- PodDisruptionBudgetの設定
- Probeによるヘルスチェック

### ハンズオン手順

#### Step 1: Namespaceの作成

```bash
kubectl create namespace production-handson
```

#### Step 2: ResourceQuotaの設定（Namespace全体のリソース制限）

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: production-handson
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production-handson
spec:
  limits:
  - default:
      cpu: "200m"
      memory: "256Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
```

```bash
kubectl apply -f resource-quota.yaml
```

#### Step 3: 本番用Deployment（詳細な設定）

```yaml
# production-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-app
  namespace: production-handson
  labels:
    app: production-app
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: production-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: production-app
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      # 異なるノードに分散配置
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: production-app
              topologyKey: kubernetes.io/hostname
      
      # 終了時の猶予期間
      terminationGracePeriodSeconds: 30
      
      containers:
      - name: app
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
          name: http
        
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        
        # 起動チェック
        startupProbe:
          httpGet:
            path: /
            port: http
          failureThreshold: 30
          periodSeconds: 2
        
        # 生存チェック
        livenessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # 準備完了チェック
        readinessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # 終了前の処理
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 10"]
---
apiVersion: v1
kind: Service
metadata:
  name: production-app
  namespace: production-handson
spec:
  selector:
    app: production-app
  ports:
  - port: 80
    targetPort: http
```

```bash
kubectl apply -f production-deployment.yaml
```

#### Step 4: HorizontalPodAutoscalerの設定

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: production-app-hpa
  namespace: production-handson
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: production-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

```bash
kubectl apply -f hpa.yaml
```

#### Step 5: PodDisruptionBudgetの設定

```yaml
# pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: production-app-pdb
  namespace: production-handson
spec:
  minAvailable: 2  # 最低2つのPodは常に稼働
  selector:
    matchLabels:
      app: production-app
```

```bash
kubectl apply -f pdb.yaml
```

### 確認コマンド

```bash
# リソースクォータの確認
kubectl describe resourcequota compute-quota -n production-handson

# HPAの状態確認
kubectl get hpa -n production-handson
kubectl describe hpa production-app-hpa -n production-handson

# PDBの確認
kubectl get pdb -n production-handson

# メトリクスの確認（metrics-serverが必要）
kubectl top pods -n production-handson

# Podの配置状況確認
kubectl get pods -n production-handson -o wide
```

### 負荷テスト（HPAの動作確認）

```bash
# 別ターミナルでHPAを監視
kubectl get hpa production-app-hpa -n production-handson -w

# 負荷をかける（Pod内から実行）
kubectl run -i --tty load-generator --rm --image=busybox:1.36 --restart=Never -n production-handson -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://production-app; done"
```

### チャレンジ課題

1. カスタムメトリクスを使用したHPAを設定してみましょう
1. Vertical Pod Autoscaler（VPA）を導入してみましょう
1. Prometheus + Grafanaで監視ダッシュボードを構築してみましょう
1. AlertManagerでアラート通知を設定してみましょう

-----

## クリーンアップ

ハンズオン終了後は以下のコマンドでリソースを削除できます。

```bash
kubectl delete namespace webapp-handson
kubectl delete namespace config-handson
kubectl delete namespace database-handson
kubectl delete namespace microservices-handson
kubectl delete namespace production-handson
```

-----

## 付録: トラブルシューティングガイド

### よくあるエラーと対処法

|症状              |確認コマンド                         |対処法                 |
|----------------|-------------------------------|--------------------|
|Pod が起動しない      |`kubectl describe pod <pod>`   |Events セクションを確認     |
|ImagePullBackOff|`kubectl describe pod <pod>`   |イメージ名・タグ・認証情報を確認    |
|CrashLoopBackOff|`kubectl logs <pod> --previous`|アプリのログでエラー原因を特定     |
|Pending 状態が続く   |`kubectl describe pod <pod>`   |リソース不足やスケジューリング制約を確認|
|Service に接続できない |`kubectl get endpoints <svc>`  |ラベルセレクタの一致を確認       |

### デバッグ用コマンド集

```bash
# イベントを時系列で確認
kubectl get events --sort-by='.lastTimestamp' -n <namespace>

# Pod のリソース使用状況
kubectl top pods -n <namespace>

# コンテナ内でシェルを起動
kubectl exec -it <pod> -- /bin/sh

# ネットワーク疎通確認用Pod
kubectl run debug --rm -it --image=nicolaka/netshoot -- /bin/bash

# YAMLの検証（dry-run）
kubectl apply -f manifest.yaml --dry-run=client
```