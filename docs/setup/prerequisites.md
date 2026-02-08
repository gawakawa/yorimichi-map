# 前提条件

## システム要件

- **Python**: 3.9以上
- **Google Cloudプロジェクト**: 以下のAPIを有効化したプロジェクト

## 必要なAPI

### 1. Vertex AI API (Gemini)

- Google AI Studio または Vertex AI のAPIキーが必要
- 自然言語処理とFunction Calling機能を使用

### 2. Google Maps Routes API

- ルート計算
- 交通情報考慮
- 通行料金算出

### 3. Google Maps Places API (New)

- スポット検索
- 評価・レビュー取得
- 写真情報取得

## APIキーの取得

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新規プロジェクトを作成（または既存プロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から必要なAPIを有効化
4. 「認証情報」からAPIキーを作成

### 注意事項

- APIキーには適切な制限を設定してください
- `.env`ファイルはGit管理から除外してください
- 本番環境では環境変数として設定することを推奨します
