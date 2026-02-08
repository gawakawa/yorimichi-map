# 🚀 セットアップ方法

## インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/drive-buddy.git
cd drive-buddy
```

### 2. 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成します：

```bash
MAPS_API_KEY=your_google_maps_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

詳細は[環境変数設定](./configuration.md)を参照してください。

### 4. アプリケーションの起動

```bash
streamlit run main.py
```

ブラウザが自動的に開き、アプリケーションが表示されます。

## 🚀 実行手順

### 1. ファイルの準備

以下のファイルが正しく配置されていることを確認します。

- `main.py` - メインアプリケーション
- `tools.py` - API連携ロジック
- `utils.py` - UI・マップ連携
- `.env` - 環境変数（APIキー）

### 2. アプリケーションの起動

ターミナルを開き、以下のコマンドを実行します。

```bash
streamlit run main.py
```

### 3. ブラウザでアクセス

自動的にブラウザが開き、アプリケーションが表示されます。
通常、`http://localhost:8501`でアクセスできます。

## トラブルシューティング

問題が発生した場合は、[トラブルシューティングガイド](../troubleshooting.md)を参照してください。
