# 💻 main.py - メインアプリケーション

## 概要

**役割**: アプリの本体。AIへの指示とFunction Callingの結果処理を行います。

## 実装コード

```python
import streamlit as st
import google.generativeai as genai
import os
from dotenv import load_dotenv
from tools import search_places, calculate_route
from utils import render_map, generate_google_maps_url
from streamlit_folium import st_folium

# --- 初期設定 ---
load_dotenv()
st.set_page_config(layout="wide", page_title="AI Drive Buddy")

# APIキーチェック
if not os.getenv("GEMINI_API_KEY") or not os.getenv("MAPS_API_KEY"):
    st.error("API Keyが設定されていません。.envファイルを確認してください。")
    st.stop()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# セッション状態の初期化
if "messages" not in st.session_state:
    st.session_state.messages = []
if "current_route" not in st.session_state:
    st.session_state.current_route = None  # 地図表示用データ

# --- Geminiのセットアップ ---
# 1. ツール定義
tools_list = [search_places, calculate_route]

# 2. システムプロンプト (AIの人格とルールの設定)
SYSTEM_PROMPT = """
あなたはGoogle Mapsと連携したプロのドライブコンシェルジュです。
ユーザーの要望（「海が見たい」「ラーメン食べたい」）に応じて、toolsを使用して最適なプランを提案してください。

ルール:
1. 場所やルートの質問には必ずツール(search_places, calculate_route)を使って実データで答えること。
2. ルートを計算した際は、料金(tolls)や所要時間を比較してアドバイスすること。
3. ユーザーが「そこに寄る」「そのルートで」と決めたら、必ず `calculate_route` を再度呼び出してルートを確定させること。
4. 常に明るく、ワクワクする口調で話すこと。
"""

# 3. モデル初期化
model = genai.GenerativeModel(
    model_name='gemini-1.5-pro-latest',
    tools=tools_list,
    system_instruction=SYSTEM_PROMPT
)

# 4. チャットセッション開始
if "chat" not in st.session_state:
    st.session_state.chat = model.start_chat(enable_automatic_function_calling=True)

# --- UI構築 ---
st.title("🚗 AI Drive Buddy")

# 2カラムレイアウト
col1, col2 = st.columns([1, 1])

# === 左側: チャットエリア ===
with col1:
    st.subheader("Plan Your Trip")

    # 履歴表示
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])

    # 入力フォーム
    if user_input := st.chat_input("例: 東京から熱海へ。途中で海鮮丼が食べたい！"):
        # ユーザーメッセージ追加
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.write(user_input)

        # AI応答生成
        with st.chat_message("assistant"):
            with st.spinner("AIがルートとスポットを検索中..."):
                try:
                    response = st.session_state.chat.send_message(user_input)
                    st.write(response.text)
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": response.text
                    })

                    # Function Callingの結果履歴から、最新のルート情報を抽出
                    # (Gemini SDKは裏でツールを呼ぶため、履歴から直近の関数実行結果を探す)
                    for part in reversed(st.session_state.chat.history):
                        if (part.role == "function" and
                            part.parts[0].function_response.name == "calculate_route"):
                            # レスポンスのJSONを取得してStateに保存
                            route_res = part.parts[0].function_response.response
                            # エラーがない場合のみ更新
                            if "error" not in route_res:
                                st.session_state.current_route = route_res
                                st.rerun()  # 地図を更新するためにリロード
                            break

                except Exception as e:
                    st.error(f"エラーが発生しました: {e}")

# === 右側: 地図 & アクションエリア ===
with col2:
    st.subheader("Route Preview")

    route_data = st.session_state.current_route

    if route_data:
        # 1. 地図表示
        m = render_map(route_data)
        if m:
            st_folium(m, width="100%", height=400)

        # 2. ルート情報のサマリー
        st.info(f"⏱️ 所要時間: {route_data.get('duration_seconds')} (混雑考慮)")

        # 3. Googleマップ起動ボタン (Deep Link)
        origin = route_data.get("origin")
        dest = route_data.get("destination")
        waypoints = route_data.get("waypoints", [])

        url = generate_google_maps_url(origin, dest, waypoints)

        st.link_button(
            "🚀 Googleマップアプリでナビ開始",
            url,
            type="primary",
            use_container_width=True
        )

        # 4. 「帰りも楽に」機能 (Return Trip)
        st.markdown("---")
        st.write("### 🏠 帰りのルート作成")
        if st.button("🔄 経由地を逆にして帰宅ルートを提案"):
            # 経由地を逆順にする
            reversed_wps = list(reversed(waypoints))

            # AIに指示を飛ばす（ユーザーの発言として処理）
            prompt = (
                f"今決まったルートの帰りのルートを作ってください。"
                f"出発地は「{dest}」、目的地は「{origin}」、"
                f"経由地は「{', '.join(reversed_wps)}」です。"
            )

            # チャット履歴に追加して送信処理へ
            st.session_state.messages.append({"role": "user", "content": prompt})
            response = st.session_state.chat.send_message(prompt)
            st.rerun()  # 強制リロードしてチャット画面に反映

    else:
        st.info("チャットで目的地とやりたいことを伝えてください。AIが地図を描画します。")
```

## コード解説

### 初期設定

1. **環境変数の読み込み**: `.env`ファイルからAPIキーを取得
2. **Streamlit設定**: 2カラムレイアウト、ページタイトル設定
3. **セッション状態の初期化**: メッセージ履歴とルート情報を管理

### Gemini AIのセットアップ

1. **ツール定義**: `search_places`と`calculate_route`をAIが使用できるよう登録
2. **システムプロンプト**: AIの役割とルールを定義
3. **モデル初期化**: Gemini 1.5 Proを使用
4. **チャットセッション**: Function Calling自動有効化

### UIレイアウト

#### 左側（チャットエリア）

- メッセージ履歴の表示
- ユーザー入力フォーム
- AI応答の表示
- Function Calling結果の処理

#### 右側（地図＆アクション）

- 地図のプレビュー表示
- ルート情報サマリー
- Googleマップ起動ボタン
- 帰路作成ボタン

### 重要な処理

#### Function Calling結果の抽出

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

Gemini SDKは裏側でツールを自動実行するため、チャット履歴から最新の`calculate_route`結果を抽出して地図を更新します。

#### 帰路作成機能

ユーザーがボタンをクリックすると、出発地と目的地を入れ替え、経由地を逆順にした指示をAIに送信します。
AIが再度`calculate_route`を呼び出し、新しいルートを計算します。
