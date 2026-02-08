<!-- markdownlint-disable MD024 -->

# 🔍 トラブルシューティング

## API キーエラー

### エラーメッセージ

```text
API Keyが設定されていません。.envファイルを確認してください。
```

### 原因

- `.env`ファイルが存在しない
- `.env`ファイルのAPIキーが正しく設定されていない
- 環境変数の読み込みに失敗している

### 解決方法

1. **`.env`ファイルの確認**

   ```bash
   # ファイルが存在するか確認
   ls -la .env

   # 内容を確認（キーは非表示にする）
   cat .env
   ```

1. **正しいフォーマットで設定**

   ```bash
   # .envファイルの内容
   MAPS_API_KEY=AIzaSy...
   GEMINI_API_KEY=AIzaSy...
   ```

1. **アプリケーションの再起動**

   ```bash
   # Streamlitアプリを停止（Ctrl+C）
   # 再度起動
   streamlit run main.py
   ```

## ルートが見つからない

### エラーメッセージ

```text
ルートが見つかりませんでした。
```

### 原因

- 場所の名称が曖昧すぎる
- 実在しない場所を指定
- APIキーの権限が不足
- ネットワーク接続の問題

### 解決方法

1. **場所の名称を具体的にする**

   ```text
   ❌ 「東京」
   ✅ 「東京駅」

   ❌ 「箱根」
   ✅ 「箱根湯本駅」
   ```

1. **APIキーの権限を確認**

   Google Cloud Consoleで以下を確認。

   - Routes APIが有効化されているか
   - APIキーに適切な権限があるか

1. **ネットワーク接続を確認**

   ```bash
   # Google Maps APIに接続できるか確認
   curl -I https://routes.googleapis.com
   ```

## 地図が表示されない

### 症状

- 地図エリアが空白
- ルート線が描画されない
- マーカーが表示されない

### 原因

- `encoded_polyline`が取得できていない
- Foliumのレンダリングエラー
- ネットワーク接続の問題

### 解決方法

1. **`encoded_polyline`の確認**

   ```python
   # デバッグ用のコードを追加
   if route_data:
       st.write("Debug:", route_data)  # ルートデータを表示
   ```

1. **Foliumのバージョン確認**

   ```bash
   pip show folium
   # バージョンが古い場合は更新
   pip install --upgrade folium streamlit-folium
   ```

1. **ブラウザのキャッシュをクリア**

   - Streamlitアプリを停止
   - ブラウザのキャッシュをクリア
   - アプリを再起動

## Function Callingが動作しない

### 症状

- AIがツールを呼び出さない
- 常にテキスト応答のみを返す
- スポット検索やルート計算が実行されない

### 原因

- ツールの登録が正しくない
- システムプロンプトの設定ミス
- Gemini APIの接続エラー

### 解決方法

1. **ツールの登録を確認**

   ```python
   # main.pyで確認
   tools_list = [search_places, calculate_route]
   model = genai.GenerativeModel(
       model_name='gemini-1.5-pro-latest',
       tools=tools_list,  # ツールが登録されているか
       system_instruction=SYSTEM_PROMPT
   )
   ```

1. **システムプロンプトの確認**

   システムプロンプトに「ツールを使用」という指示が含まれているか確認

1. **Gemini APIキーの確認**

   ```bash
   # .envファイルでGEMINI_API_KEYが設定されているか確認
   cat .env | grep GEMINI_API_KEY
   ```

## Googleマップアプリが起動しない

### 症状

- ボタンをクリックしてもアプリが開かない
- Webブラウザで開いてしまう

### 原因

- モバイルアプリがインストールされていない
- URLスキームの問題
- ブラウザの設定

### 解決方法

1. **モバイルアプリのインストール**

   - iOS: App Storeから「Googleマップ」をインストール
   - Android: Google Playから「Googleマップ」をインストール

1. **URLエンコーディングの確認**

   ```python
   # utils.pyで確認
   return base_url + "&" + urllib.parse.urlencode(params)
   ```

1. **ブラウザの設定**

   - Safariの場合: 「設定」→「Safari」→「ポップアップブロック」をオフ
   - Chromeの場合: 「設定」→「サイトの設定」→「ポップアップとリダイレクト」を許可

## 依存関係のインストールエラー

### エラーメッセージ

```text
ERROR: Could not find a version that satisfies the requirement...
```

### 原因

- Pythonのバージョンが古い
- pipのバージョンが古い
- ネットワーク接続の問題

### 解決方法

1. **Pythonのバージョン確認**

   ```bash
   python --version
   # Python 3.9以上であることを確認
   ```

1. **pipの更新**

   ```bash
   pip install --upgrade pip
   ```

1. **依存関係の再インストール**

   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

## パフォーマンスの問題

### 症状

- アプリの起動が遅い
- AIの応答が遅い
- 地図の描画が遅い

### 原因

- APIのレスポンスが遅い
- ネットワーク接続が不安定
- 大量のデータを処理している

### 解決方法

1. **APIのタイムアウト設定**

   ```python
   # tools.pyで調整
   response = requests.post(url, json=payload, headers=headers, timeout=10)
   ```

1. **キャッシュの活用**

   Streamlitのキャッシュ機能を使用：

   ```python
   @st.cache_data
   def cached_search_places(location_query, place_type):
       return search_places(location_query, place_type)
   ```

1. **スポット検索件数の調整**

   ```python
   # tools.pyで調整
   payload = {
       "textQuery": f"{place_type} near {location_query}",
       "minRating": 4.0,
       "maxResultCount": 3  # 件数を減らす
   }
   ```

## 一般的なデバッグ方法

### ログの確認

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### デバッグ情報の表示

```python
# Streamlitで中間データを表示
st.write("Debug:", variable_name)
```

### ネットワークの確認

```bash
# APIエンドポイントに接続できるか確認
curl -I https://places.googleapis.com/v1/places:searchText
curl -I https://routes.googleapis.com/directions/v2:computeRoutes
```

## サポートリソース

### 公式ドキュメント

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Streamlit Documentation](https://docs.streamlit.io)

### コミュニティ

- Stack Overflow
- GitHub Issues
- Google Maps Platform Forum
