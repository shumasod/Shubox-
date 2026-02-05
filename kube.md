# Kubernetes 基本情報まとめ

## Kubernetesとは

Kubernetes（K8s）は、コンテナ化されたアプリケーションのデプロイ、スケーリング、管理を自動化するためのオープンソースプラットフォーム。Googleが開発し、現在はCNCF（Cloud Native Computing Foundation）が管理している。

## アーキテクチャ

### Control Plane（マスターコンポーネント）

|コンポーネント                 |役割                                        |
|------------------------|------------------------------------------|
|kube-apiserver          |Kubernetes APIを公開するフロントエンド。全ての操作の入り口      |
|etcd                    |クラスタの全データを保存する分散キーバリューストア                 |
|kube-scheduler          |新規Podをどのノードに配置するか決定                       |
|kube-controller-manager |コントローラープロセスを実行（ReplicaSet, Deployment等の管理）|
|cloud-controller-manager|クラウドプロバイダー固有の制御ロジックを実行                    |

### Node（ワーカーコンポーネント）

|コンポーネント          |役割                           |
|-----------------|-----------------------------|
|kubelet          |各ノードで動作し、Podの実行を管理           |
|kube-proxy       |ネットワークルールを管理し、Service経由の通信を実現|
|Container Runtime|コンテナを実行（containerd, CRI-O等）  |

## 基本リソース

### Pod

Kubernetesの最小デプロイ単位。1つ以上のコンテナをグループ化したもの。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
```

### Deployment

Podのレプリカセットを管理し、ローリングアップデートやロールバックを提供。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

### Service

Podへのネットワークアクセスを抽象化。主な種類は以下の通り。

|タイプ         |説明                      |
|------------|------------------------|
|ClusterIP   |クラスタ内部からのみアクセス可能（デフォルト） |
|NodePort    |各ノードのIPと静的ポートでServiceを公開|
|LoadBalancer|クラウドプロバイダーのLBを使用して外部公開  |
|ExternalName|CNAMEレコードを返す            |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

### ConfigMap / Secret

ConfigMapは設定データ、Secretは機密データを管理。

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "mysql.example.com"
  LOG_LEVEL: "info"

---
# Secret
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=  # base64エンコード
```

### Ingress

HTTPおよびHTTPSルーティングを管理し、外部からServiceへのアクセスを制御。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

### Namespace

クラスタを論理的に分割するための仕組み。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

### PersistentVolume / PersistentVolumeClaim

永続的なストレージを管理。

```yaml
# PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

## 主要なkubectlコマンド

### クラスタ情報

```bash
# クラスタ情報の確認
kubectl cluster-info

# ノード一覧
kubectl get nodes

# 全リソースの確認
kubectl get all -A
```

### リソース操作

```bash
# リソースの作成・適用
kubectl apply -f manifest.yaml

# リソースの削除
kubectl delete -f manifest.yaml

# Pod一覧
kubectl get pods -n <namespace>

# 詳細情報の確認
kubectl describe pod <pod-name>

# ログの確認
kubectl logs <pod-name> -f

# Pod内でコマンド実行
kubectl exec -it <pod-name> -- /bin/bash
```

### デバッグ

```bash
# イベントの確認
kubectl get events --sort-by='.lastTimestamp'

# リソースのYAML出力
kubectl get deployment <name> -o yaml

# ポートフォワード
kubectl port-forward pod/<pod-name> 8080:80

# リソース使用状況
kubectl top pods
kubectl top nodes
```

### スケーリング

```bash
# レプリカ数の変更
kubectl scale deployment <name> --replicas=5

# オートスケールの設定
kubectl autoscale deployment <name> --min=2 --max=10 --cpu-percent=80
```

## ラベルとセレクタ

リソースの識別と選択に使用。

```bash
# ラベルの付与
kubectl label pods <pod-name> environment=production

# ラベルでフィルタリング
kubectl get pods -l app=nginx
kubectl get pods -l 'environment in (production, staging)'
```

## リソース制限とリクエスト

|項目      |説明               |
|--------|-----------------|
|requests|Pod起動時に保証されるリソース量|
|limits  |Podが使用できるリソースの上限 |

## ヘルスチェック

```yaml
spec:
  containers:
  - name: app
    livenessProbe:      # コンテナが生きているか確認
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:     # トラフィックを受ける準備ができているか確認
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
    startupProbe:       # 起動完了したか確認（遅い起動のアプリ向け）
      httpGet:
        path: /healthz
        port: 8080
      failureThreshold: 30
      periodSeconds: 10
```

## よく使うリソースの略称

|略称    |リソース名                 |
|------|----------------------|
|po    |pods                  |
|deploy|deployments           |
|svc   |services              |
|ns    |namespaces            |
|cm    |configmaps            |
|pv    |persistentvolumes     |
|pvc   |persistentvolumeclaims|
|ing   |ingresses             |
|no    |nodes                 |
|rs    |replicasets           |
|ds    |daemonsets            |
|sts   |statefulsets          |

## 参考リンク

- [Kubernetes 公式ドキュメント](https://kubernetes.io/ja/docs/home/)
- [kubectl チートシート](https://kubernetes.io/ja/docs/reference/kubectl/cheatsheet/)
- [Kubernetes API リファレンス](https://kubernetes.io/docs/reference/kubernetes-api/)