"""Vertex AI Gemini との対話および Automatic Function Calling を管理するモジュール。

このモジュールは以下の処理を担当する:
1. Gemini 1.5 Pro モデルの初期化（Vertex AI SDK 経由）
2. search_places / calculate_route を FunctionDeclaration として定義し、Gemini に登録
3. AutomaticFunctionCallingResponder により、Gemini が必要に応じてツールを自動実行
4. フロントエンドから受け取った会話履歴を Vertex AI の Content 形式に変換
5. Gemini の応答テキストと、Function Calling で得られたルート・スポットデータを返却

動作の流れ:
  ユーザーメッセージ → Gemini に送信 → Gemini がツール呼び出しを判断
  → search_places / calculate_route が自動実行される → 結果を Gemini が要約して応答

認証:
  Application Default Credentials (ADC) を使用。
  開発時は `gcloud auth application-default login` で認証する。
"""

from __future__ import annotations

import logging
import os
from typing import Any

import vertexai
from django.conf import settings
from vertexai.generative_models import (
    Content,
    FunctionDeclaration,
    Part,
    Tool,
)
from vertexai.preview.generative_models import (
    AutomaticFunctionCallingResponder,
    GenerativeModel,
)

from . import google_maps

logger = logging.getLogger(__name__)

# Gemini に設定するシステムプロンプト。
# AI がドライブコンシェルジュとして振る舞い、ツールを適切に使うよう指示する。
SYSTEM_PROMPT = """\
あなたはGoogle Mapsと連携したプロのドライブコンシェルジュです。
ユーザーの要望（「海が見たい」「ラーメン食べたい」）に応じて、
toolsを使用して最適なプランを提案してください。

ルール:
1. 場所やルートの質問には必ずツール(search_places, calculate_route)を使って実データで答えること。
2. ルートを計算した際は、料金(tolls)や所要時間を比較してアドバイスすること。
3. ユーザーが「そこに寄る」「そのルートで」と決めたら、必ず calculate_route を再度呼び出してルートを確定させること。
4. 常に明るく、ワクワクする口調で話すこと。
"""

# --- Gemini Function Calling 用の関数宣言 ---
# Gemini が「スポットを調べたい」と判断したときに自動呼び出しされる関数の定義。
# name / description / parameters を OpenAPI 風のスキーマで記述する。
_search_places_func = FunctionDeclaration(
    name="search_places",
    description="指定した場所の周辺でスポットを検索します。",
    parameters={
        "type": "object",
        "properties": {
            "location_query": {
                "type": "string",
                "description": "検索する場所やエリア名（例: '箱根', '東京駅周辺'）",
            },
            "place_type": {
                "type": "string",
                "description": "検索する施設の種類（例: 'restaurant', 'tourist_attraction', 'cafe'）",
            },
        },
        "required": ["location_query"],
    },
)

# Gemini が「ルートを計算したい」と判断したときに自動呼び出しされる関数の定義。
_calculate_route_func = FunctionDeclaration(
    name="calculate_route",
    description="出発地から目的地までのドライブルートを計算します。経由地も指定できます。",
    parameters={
        "type": "object",
        "properties": {
            "origin": {
                "type": "string",
                "description": "出発地（例: '東京駅'）",
            },
            "destination": {
                "type": "string",
                "description": "目的地（例: '箱根湯本駅'）",
            },
            "waypoints": {
                "type": "array",
                "items": {"type": "string"},
                "description": "経由地のリスト（例: ['手打ち蕎麦 山路']）",
            },
        },
        "required": ["origin", "destination"],
    },
)

# 上記2つの関数宣言をまとめて Tool オブジェクトにする。
# この Tool を GenerativeModel に渡すことで Gemini がツールとして認識する。
_tools = Tool(function_declarations=[_search_places_func, _calculate_route_func])

# AutomaticFunctionCallingResponder が Gemini のツール呼び出しを受け取り、
# 対応する Python 関数を自動実行するためのマッピングを登録する。
# SDK は CallableFunctionDeclaration（._function 属性を持つ）を要求するため、
# FunctionDeclaration.from_func() で生成したオブジェクトをマッピングに使う。
_tools._callable_functions = {
    "search_places": FunctionDeclaration.from_func(google_maps.search_places),
    "calculate_route": FunctionDeclaration.from_func(google_maps.calculate_route),
}

# Vertex AI SDK の初期化フラグ（1プロセスで1回だけ初期化する）
_initialized = False


def _ensure_initialized() -> None:
    """Vertex AI SDK を遅延初期化する。

    初回呼び出し時のみ vertexai.init() を実行し、GCP プロジェクトとリージョンを設定する。
    settings から GOOGLE_CLOUD_PROJECT / GOOGLE_CLOUD_LOCATION を読み取る。
    """
    global _initialized  # noqa: PLW0603
    if not _initialized:
        vertexai.init(
            project=settings.GOOGLE_CLOUD_PROJECT,
            location=settings.GOOGLE_CLOUD_LOCATION,
        )
        _initialized = True


def _build_history(history: list[dict[str, str]]) -> list[Content]:
    """フロントエンドから受け取ったチャット履歴を Vertex AI の Content 形式に変換する。"""
    contents: list[Content] = []
    for msg in history:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append(
            Content(role=role, parts=[Part.from_text(msg.get("content", ""))])
        )
    return contents


def send_message(
    message: str,
    history: list[dict[str, str]] | None = None,
) -> tuple[str, dict[str, Any] | None, list[dict[str, Any]] | None]:
    """Gemini にメッセージを送信し、AI 応答と Function Calling 結果を返す。

    処理フロー:
      1. Vertex AI SDK を初期化（初回のみ）
      2. Gemini 1.5 Pro モデルをシステムプロンプト付きで生成
      3. AutomaticFunctionCallingResponder を設定（最大5回の自動呼び出し）
      4. フロントエンドの会話履歴を Content 形式に変換してチャットセッションを開始
      5. ユーザーメッセージを送信 → Gemini が必要に応じて search_places / calculate_route を自動実行
      6. チャット履歴から Function Calling の結果（ルート・スポット）を抽出
      7. AI 応答テキスト + ルートデータ + スポットデータのタプルを返却

    Args:
        message: ユーザーの入力テキスト
        history: これまでの会話履歴（[{role: "user"|"assistant", content: "..."}]）

    Returns:
        (reply_text, route_data_or_none, places_data_or_none) のタプル
        - reply_text: AI の応答テキスト
        - route_data: calculate_route の結果（呼ばれなかった場合は None）
        - places_data: search_places の結果（呼ばれなかった場合は None）
    """
    _ensure_initialized()

    max_history = int(os.environ.get("GEMINI_MAX_HISTORY_LENGTH", "10"))
    if history and len(history) > max_history:
        history = history[-max_history:]
        logger.info("Conversation history truncated to %d messages", max_history)

    # Gemini 2.5 Pro モデルを生成（システムプロンプトとツールを設定）
    model = GenerativeModel(
        "gemini-2.5-pro",
        system_instruction=SYSTEM_PROMPT,
        tools=[_tools],
    )

    # Automatic Function Calling: Gemini がツール呼び出しを判断したら、
    # SDK が自動的に対応する Python 関数を実行し、結果を Gemini に返す。
    # max_automatic_function_calls=5 で無限ループを防止。
    afc_responder = AutomaticFunctionCallingResponder(
        max_automatic_function_calls=5,
    )

    # フロントエンドの会話履歴を Vertex AI の Content 形式に変換
    contents = _build_history(history or [])

    # 既存の会話履歴を引き継いでチャットセッションを開始
    # responder を start_chat に渡すことで、Gemini のツール呼び出しが自動処理される。
    chat = model.start_chat(history=contents, responder=afc_responder)

    route_data: dict[str, Any] | None = None
    places_data: list[dict[str, Any]] | None = None

    # メッセージを送信。Gemini がツール呼び出しを必要と判断した場合、
    # afc_responder により自動的に search_places / calculate_route が実行される。
    response = chat.send_message(message)

    # チャット履歴を走査し、Function Calling の実行結果を抽出する。
    # Gemini が複数回ツールを呼ぶ可能性があるため、最後の結果で上書きする。
    for content in chat.history:
        for part in content.parts:
            fn_response = part.function_response
            if fn_response is None:
                continue
            name = fn_response.name
            result = dict(fn_response.response) if fn_response.response else {}

            if name == "calculate_route" and "error" not in result:
                route_data = result
            elif name == "search_places" and isinstance(result, list):
                places_data = result
            elif name == "search_places" and "error" not in result:
                places_data = result.get("results", [])

    reply_text = response.text if response.text else ""

    return reply_text, route_data, places_data
