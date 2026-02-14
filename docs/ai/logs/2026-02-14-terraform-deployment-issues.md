# Terraform Deployment Issues (2026-02-14)

## Summary

Terraform設定の拡充作業中に発見された本番環境の問題点。

## Applied Changes

以下の変更は正常に適用された：

- Vertex AI API (`aiplatform.googleapis.com`) 有効化
- Cloud Run サービスアカウントに `roles/aiplatform.user` 権限付与
- `maps-api-key` シークレット作成（Secret Manager）
- バックエンド環境変数追加:
  - `MAPS_API_KEY` (Secret Manager経由)
  - `GOOGLE_CLOUD_PROJECT`
  - `CORS_ALLOWED_ORIGINS`

## Issues Found

### 1. Frontend: nginx startup failure

**Severity**: Critical
**Status**: Open
**Component**: Frontend Docker image

**Symptom**:

```text
nginx: [emerg] getpwnam("root") failed (2: No such file or directory) in /nix/store/.../nginx.conf:1
Container called exit(1).
```

**Root Cause**:
Nix でビルドされた nginx コンテナが Cloud Run 環境で `root` ユーザーを参照しようとしているが、Cloud Run のコンテナ環境には `/etc/passwd` が存在しない、または `root` ユーザーが定義されていない。

**Impact**:

- フロントエンドが起動不可
- `frontend_url` output が空

**Solution Options**:

1. nginx.conf で `user` ディレクティブを削除または変更
2. Dockerfile でユーザー情報を含める
3. Cloud Run の実行ユーザー設定を調整

---

### 2. Backend: DJANGO_ALLOWED_HOSTS misconfiguration

**Severity**: High
**Status**: Open
**Component**: Backend Cloud Run / Terraform

**Symptom**:

```text
HTTP 400 Bad Request
DisallowedHost at /api/health/
```

**Current Configuration**:

```text
DJANGO_ALLOWED_HOSTS = ".run.app,localhost"
```

**Actual Host**:

```text
yorimichi-map-backend-rym62eqzhq-an.a.run.app
```

**Root Cause**:
Cloud Run の URL は `*.a.run.app` 形式だが、Django の `ALLOWED_HOSTS` 設定 `.run.app` がサブドメインを正しくカバーしていない可能性がある。

**Impact**:

- バックエンド API がリクエストを拒否
- ヘルスチェック失敗

**Solution Options**:

1. `DJANGO_ALLOWED_HOSTS` を `.a.run.app` に変更
2. 完全なホスト名を明示的に指定
3. `*` を使用（開発/テスト用、本番非推奨）

**Terraform Location**:
`terraform/cloud-run.tf` line 99-101

---

## Next Steps

1. [ ] フロントエンドの nginx.conf を修正してユーザー問題を解消
2. [ ] `DJANGO_ALLOWED_HOSTS` を `.a.run.app` に修正
3. [ ] `maps-api-key` に実際の Google Maps API Key を設定
4. [ ] 修正後に再デプロイして動作確認

## Related Files

- `terraform/cloud-run.tf` - Cloud Run サービス定義
- `terraform/secrets.tf` - Secret Manager 定義
- `frontend/` - フロントエンド Dockerfile / nginx 設定
