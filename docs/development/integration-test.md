# 外部 API 疎通テスト

バックエンドの各サービスが外部 API と正常に通信できることを確認する疎通テスト。

## 前提条件

### 1. Google Cloud 認証 (Vertex AI 用)

```bash
gcloud auth application-default login
```

### 2. 環境変数の設定

`backend/.env` に以下を設定する:

```env
# Google Maps API Key (Places API (New) + Routes API を有効化済みのキー)
MAPS_API_KEY=<your-api-key>

# Vertex AI (Gemini) - GCP プロジェクト設定
GOOGLE_CLOUD_PROJECT=<your-project-id>
GOOGLE_CLOUD_LOCATION=asia-northeast1
```

### 3. Google Cloud で有効化が必要な API

- Vertex AI API
- Places API (New)
- Routes API

## テストの実行

```bash
cd backend
direnv exec . python -m pytest tests/test_integration.py -v -s
```

### 特定のテストのみ実行

```bash
# Deep Link テスト（外部API不要）
direnv exec . python -m pytest tests/test_integration.py::TestDeepLink -v -s

# Places API テスト
direnv exec . python -m pytest tests/test_integration.py::TestPlacesAPI -v -s

# Routes API テスト
direnv exec . python -m pytest tests/test_integration.py::TestRoutesAPI -v -s

# Gemini テスト
direnv exec . python -m pytest tests/test_integration.py::TestGeminiAPI -v -s

# Django エンドポイントテスト
direnv exec . python -m pytest tests/test_integration.py::TestDjangoEndpoints -v -s
```

## テスト一覧

| テスト | 必要な環境変数 | 内容 |
|--------|---------------|------|
| `TestDeepLink` | なし | Google Maps URL 生成の動作確認 |
| `TestPlacesAPI` | `MAPS_API_KEY` | Places API (New) でスポット検索 |
| `TestRoutesAPI` | `MAPS_API_KEY` | Routes API v2 でルート計算 |
| `TestGeminiAPI` | `GOOGLE_CLOUD_PROJECT` + ADC | Vertex AI Gemini との対話 |
| `TestDjangoEndpoints` | 全て | Django REST API エンドポイントの疎通 |

環境変数が未設定のテストは自動的にスキップされる。

## トラブルシューティング

### `AutomaticFunctionCallingResponder` のインポートエラー

`vertexai.preview.generative_models` からインポートする必要がある（SDK 1.136.0 時点）。

### モデルが見つからない

`gemini-2.5-pro` を使用する。`asia-northeast1` リージョンで利用可能。

### `ALLOWED_HOSTS` エラー

Django テストクライアントは `testserver` ホストを使用する。テストコード内で `ALLOWED_HOSTS` を `["*"]` に設定するフィクスチャで対応済み。

## API レート制限・クォータ情報

本番運用時は以下のレート制限・クォータに注意すること。

| API | 制限項目 | デフォルト上限 | 備考 |
|-----|---------|--------------|------|
| Places API (New) | QPD (Queries Per Day) | プロジェクトの課金プランに依存 | [料金ページ](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)参照 |
| Routes API | QPD (Queries Per Day) | プロジェクトの課金プランに依存 | [料金ページ](https://developers.google.com/maps/documentation/routes/usage-and-billing)参照 |
| Vertex AI Gemini | RPM (Requests Per Minute) | モデル・リージョンにより異なる | [クォータページ](https://cloud.google.com/vertex-ai/generative-ai/docs/quotas)参照 |
| Vertex AI Gemini | TPM (Tokens Per Minute) | モデル・リージョンにより異なる | 同上 |

### クォータ超過時の対処

- Google Cloud Console の「IAM と管理」→「割り当て」からクォータ使用状況を確認
- 必要に応じてクォータ引き上げをリクエスト
- アプリケーションレベルのレート制限（Django-ratelimit 等）の導入も検討
