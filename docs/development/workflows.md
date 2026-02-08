# 🎯 開発フローとフェーズ

## 開発フェーズ

### Phase 1: MVP（最初の数時間）

- ✅ StreamlitでチャットUIを構築
- ✅ Gemini APIを接続してテキスト会話を実装
- ✅ 固定の場所でRoutes APIを呼び出し
- ✅ 地図上にルート線を描画

**目標**: 基本的な会話とルート表示ができる状態

### Phase 2: Function Calling（メイン開発）

- ✅ `find_places`と`calculate_route`関数を実装
- ✅ Geminiにツールを登録
- ✅ 会話の中でルートが変わる体験を作り込み

**目標**: AIが自動的にスポット検索とルート計算を行う

### Phase 3: 磨き上げ（差別化）

- ✅ Googleマップ起動ボタン（ディープリンク）実装
- ✅ 「リストから帰路作成」機能の実装
- ✅ 通行料金の表示
- ✅ リアルタイム交通情報の考慮

**目標**: 実用的で差別化されたユーザー体験

## 実装のポイント（審査員向けアピール）

### 1. State Management

AIの裏側の思考プロセス（Function Callingの結果）をフックして、UI（地図）をリアルタイムに書き換えている点が技術的な工夫です。

### 2. Deep Linking

単なる地図表示で終わらせず、「実社会での行動（運転）」に繋げるURLスキーム実装を入れています。

### 3. Generative UI

会話の内容に応じて、「帰りのルートボタン」などのUIコンポーネントが動的に機能します。

## デモシナリオ（ハッカソン用）

### シナリオ1: 基本的な使い方

**ユーザー**: 「東京駅から箱根湯本まで行きたい。途中で評価の高いお蕎麦屋さんに行きたい。」

**AI**:

- 自動で`search_places`で蕎麦屋を検索
- `calculate_route`でルート計算
- 地図が表示される

**ユーザー**: 「ありがとう。じゃあその蕎麦屋さん経由で。」

**アクション**:

- 右側の「🚀 Googleマップアプリでナビ開始」ボタンをクリック
- 実際のGoogleマップアプリが開く

### シナリオ2: 帰路の自動生成

**アクション**: 「🔄 経由地を逆にして帰宅ルートを提案」ボタンをクリック

**AI**:

- 自動的に出発地と目的地を入れ替え
- 経由地を逆順にしたルートを計算
- 地図を更新

## Function Callingのフロー

1. **ユーザー入力**: 「お腹すいた。近くでラーメン。」
2. **AI分析**: Geminiが`find_places(query='ラーメン', location='現在ルート周辺')`を呼ぶべきと判断
3. **API実行**: Places APIを叩き、候補リスト（JSON）を取得
4. **AI推論**: Geminiが結果を分析 - 「A店は評価4.5ですが行列必須、B店は評価4.2で駐車場あり。ドライブならBがおすすめ」
5. **ユーザー決定**: 「B店経由で！」
6. **ルート再計算**: Geminiが`calculate_route(waypoints=['B店'])`を実行
7. **可視化**: Streamlitの地図を更新
8. **ハンドオフ**: ディープリンクを含むGoogleマップ起動ボタンを生成

## ディープリンク生成

```python
def generate_google_maps_url(origin, destination, waypoints=None):
    """Googleマップアプリ起動用URLを生成"""
    base_url = "https://www.google.com/maps/dir/?api=1"

    params = {
        "origin": origin,
        "destination": destination,
        "travelmode": "driving"
    }
    if waypoints:
        params["waypoints"] = "|".join(waypoints)

    return base_url + "&" + urllib.parse.urlencode(params)
```

## 参考資料

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Streamlit Documentation](https://docs.streamlit.io)
