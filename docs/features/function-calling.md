# 🔧 Function Callingのフロー

## Function Callingとは

Gemini AIが、ユーザーの要望を解釈して、適切なAPI関数を自動的に呼び出す機能です。

## 登録されている関数

### 1. search_places()

**目的**: 場所周辺のスポットを検索

**パラメータ**:

- `location_query`: 場所の名前（例: "箱根湯本駅"）
- `place_type`: 施設タイプ（例: "restaurant", "tourist_attraction"）

**使用API**: Google Maps Places API (New)

### 2. calculate_route()

**目的**: ルート計算と交通情報取得

**パラメータ**:

- `origin`: 出発地の名称
- `destination`: 目的地の名称
- `waypoints`: 経由地のリスト

**使用API**: Google Maps Routes API

## 実行フロー

### ステップ1: ユーザー入力

```text
ユーザー: 「お腹すいた。近くでラーメン。」
```

### ステップ2: AI分析

Geminiが入力を解析して、適切な関数を判断：

```python
# AIの内部判断
# → search_places(location_query='現在ルート周辺', place_type='ラーメン')を呼ぶべき
```

### ステップ3: API実行

システムが自動的にPlaces APIを実行：

```python
results = search_places(
    location_query='現在ルート周辺',
    place_type='ラーメン'
)
```

### ステップ4: 結果取得

```json
[
  {
    "name": "A店",
    "rating": 4.5,
    "address": "東京都...",
    "price_level": "MODERATE"
  },
  {
    "name": "B店",
    "rating": 4.2,
    "address": "東京都...",
    "price_level": "INEXPENSIVE"
  }
]
```

### ステップ5: AI推論

Geminiが結果を分析して推薦：

```text
AI: 「A店は評価4.5ですが行列必須、B店は評価4.2で駐車場あり。
     ドライブならBがおすすめです。」
```

### ステップ6: ユーザー決定

```text
ユーザー: 「B店経由で！」
```

### ステップ7: ルート再計算

Geminiが自動的に`calculate_route`を実行：

```python
route = calculate_route(
    origin='東京駅',
    destination='箱根湯本',
    waypoints=['B店']
)
```

### ステップ8: 可視化

Streamlitの地図を更新：

```python
st.session_state.current_route = route
st.rerun()  # 地図を再描画
```

### ステップ9: ハンドオフ

ディープリンクを含むGoogleマップ起動ボタンを生成：

```python
url = generate_google_maps_url(
    origin='東京駅',
    destination='箱根湯本',
    waypoints=['B店']
)
```

## Geminiのシステムプロンプト

```python
SYSTEM_PROMPT = """
あなたはGoogle Mapsと連携したプロのドライブコンシェルジュです。
ユーザーの要望（「海が見たい」「ラーメン食べたい」）に応じて、
toolsを使用して最適なプランを提案してください。

ルール:
1. 場所やルートの質問には必ずツール(search_places, calculate_route)を使って実データで答えること。
2. ルートを計算した際は、料金(tolls)や所要時間を比較してアドバイスすること。
3. ユーザーが「そこに寄る」「そのルートで」と決めたら、必ず `calculate_route` を再度呼び出してルートを確定させること。
4. 常に明るく、ワクワクする口調で話すこと。
"""
```

## 自動Function Calling

Gemini SDKの`enable_automatic_function_calling=True`により、
関数の呼び出しと結果の処理が自動化されています：

```python
chat = model.start_chat(enable_automatic_function_calling=True)
response = chat.send_message(user_input)
```

## Function Calling結果の抽出

チャット履歴から最新の`calculate_route`結果を取得：

```python
for part in reversed(st.session_state.chat.history):
    if (part.role == "function" and
        part.parts[0].function_response.name == "calculate_route"):
        route_res = part.parts[0].function_response.response
        if "error" not in route_res:
            st.session_state.current_route = route_res
            st.rerun()
        break
```

## エラーハンドリング

### API呼び出しエラー

各関数は、エラー時に以下の形式で返します：

```python
{"error": "エラーメッセージ"}
```

AIは、このエラーを受け取ると、ユーザーに適切なフィードバックを提供します：

```text
AI: 「申し訳ございません。ルートが見つかりませんでした。
     場所の名称をもう少し具体的に教えていただけますか？」
```

## 複数関数の連続実行

AIは、必要に応じて複数の関数を連続して実行します。

```text
ユーザー: 「温泉に入ってから、美術館も寄りたい。」

AI:
1. search_places(location_query='ルート周辺', place_type='温泉')
2. search_places(location_query='ルート周辺', place_type='美術館')
3. calculate_route(origin='...', destination='...', waypoints=['温泉A', '美術館B'])
```

## 利点

1. **自然な会話**: ユーザーは自由な言葉で要望を伝えられる
2. **自動判断**: AIが適切な関数を選択
3. **エラーリカバリー**: 失敗時に代替案を提案
4. **文脈理解**: 会話の流れを考慮した提案
