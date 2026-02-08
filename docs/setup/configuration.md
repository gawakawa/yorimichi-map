# 🔧 環境変数設定

## .env ファイル設定

Google Cloud Consoleで取得したAPIキーを設定します。

### 必要なAPIキー

#### MAPS_API_KEY

- 「Routes API」と「Places API (New)」を有効化したキー
- Google Maps Platformで取得

#### GEMINI_API_KEY

- Google AI Studio または Vertex AI のキー
- Gemini APIの利用に必要

### .env ファイルの作成

プロジェクトルートに`.env`ファイルを作成し、以下の内容を記述します：

```bash
MAPS_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...
```

### セキュリティ上の注意

⚠️ **重要**: `.env`ファイルは機密情報を含むため、以下の点に注意してください。

- `.gitignore`に`.env`を追加して、Git管理から除外
- APIキーは絶対に公開リポジトリにコミットしない
- チーム間で共有する場合は、安全な方法（1Password、AWS Secrets Managerなど）を使用
- 本番環境では環境変数として直接設定することを推奨

### API キーの権限設定

Google Cloud Consoleで、APIキーに適切な制限を設定してください。

- **アプリケーションの制限**: IPアドレス制限またはHTTPリファラー制限
- **APIの制限**: 必要なAPIのみに制限
  - Routes API
  - Places API (New)
  - Vertex AI API

## インストールコマンド

依存関係をインストールします：

```bash
pip install -r requirements.txt
```

## 設定の確認

アプリケーション起動時に、APIキーが正しく設定されているか自動的にチェックされます。
エラーが表示される場合は、`.env`ファイルの内容を確認してください。
