from __future__ import annotations

import logging
from typing import Any

import vertexai
from django.conf import settings
from vertexai.generative_models import (
    AutomaticFunctionCallingResponder,
    Content,
    FunctionDeclaration,
    GenerativeModel,
    Part,
    Tool,
)

from . import google_maps

logger = logging.getLogger(__name__)

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

_tools = Tool(function_declarations=[_search_places_func, _calculate_route_func])

_FUNCTION_MAP: dict[str, Any] = {
    "search_places": google_maps.search_places,
    "calculate_route": google_maps.calculate_route,
}

_initialized = False


def _ensure_initialized() -> None:
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
    """Gemini にメッセージを送信し、応答とfunction calling結果を返す。

    Returns:
        tuple of (reply_text, route_data_or_none, places_data_or_none)
    """
    _ensure_initialized()

    model = GenerativeModel(
        "gemini-1.5-pro",
        system_instruction=SYSTEM_PROMPT,
        tools=[_tools],
    )

    afc_responder = AutomaticFunctionCallingResponder(
        max_automatic_function_calls=5,
    )

    contents = _build_history(history or [])

    chat = model.start_chat(history=contents)

    route_data: dict[str, Any] | None = None
    places_data: list[dict[str, Any]] | None = None

    response = chat.send_message(
        message,
        tools=[_tools],
        automatic_function_calling=afc_responder,
    )

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
