# 🛠️ 技術スタック

## AI エンジン

- **Google Gemini 1.5 Pro** (Vertex AI)
  - 自然言語理解
  - Function Calling機能
  - リアルタイム会話処理

## API

### Google Maps Platform

- **Google Maps Routes API**
  - ルート計算
  - 料金算出
  - 交通情報取得

- **Google Maps Places API (New)**
  - スポット検索
  - 評価・レビュー
  - 写真情報

## フロントエンド

- **Streamlit**: UIフレームワーク
- **Folium**: 地図可視化ライブラリ
- **streamlit-folium**: Streamlit用Folium統合

## バックエンド

- **Python 3.9+**
- **google-generativeai**: Gemini API SDK
- **requests**: HTTP通信
- **python-dotenv**: 環境変数管理
- **polyline**: 地図ポリラインのデコード

## 📁 プロジェクト構成

```text
drive-buddy/
├── .env                  # APIキーなどの機密情報
├── requirements.txt      # 必要なライブラリ一覧
├── main.py               # フロントエンドとアプリのメインロジック
├── tools.py              # Google Maps APIを叩く関数群
└── utils.py              # 地図描画やデータ変換のユーティリティ
```

## 依存ライブラリ (requirements.txt)

```text
streamlit
google-generativeai
requests
python-dotenv
folium
streamlit-folium
polyline
```

## 必要なAPI

以下のAPIを有効化したGoogle Cloudプロジェクトが必要です:

- Vertex AI API (Gemini)
- Google Maps Routes API
- Google Maps Places API (New)
