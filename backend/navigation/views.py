"""navigation API のビュー（エンドポイント実装）。

chat:
  フロントエンドからのメッセージを Vertex AI Gemini に送信し、
  Automatic Function Calling により search_places / calculate_route が自動実行される。
  AIの応答テキストに加え、ルートデータやスポット情報があればまとめて返却する。

return_route:
  行きのルート情報（origin, destination, waypoints）を受け取り、
  出発地⇔目的地を入れ替え・経由地を逆順にして Routes API で帰り道を計算する。
"""

from __future__ import annotations

import logging
from typing import Any

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import (
    ChatRequestSerializer,
    ChatResponseSerializer,
    ReturnRouteRequestSerializer,
    ReturnRouteResponseSerializer,
)
from .services.deep_link import generate_google_maps_url
from .services.gemini import send_message
from .services.google_maps import calculate_route

logger = logging.getLogger(__name__)


def _attach_deep_link(route_data: dict[str, Any]) -> dict[str, Any]:
    """ルートデータに Google Maps ディープリンクURLを付与する。

    ルート計算結果に google_maps_url フィールドを追加して返す。
    このURLをタップ/クリックすると Google Maps アプリでナビが起動する。
    """
    route_data["google_maps_url"] = generate_google_maps_url(
        origin=route_data["origin"],
        destination=route_data["destination"],
        waypoints=route_data.get("waypoints"),
    )
    return route_data


@extend_schema(
    summary="AIチャット",
    description="AIドライブコンシェルジュとの対話。Function Callingでルート・スポット検索を自動実行。",
    request=ChatRequestSerializer,
    responses={200: ChatResponseSerializer},
)
@api_view(["POST"])
def chat(request: Request) -> Response:
    """AI チャットエンドポイント。

    処理フロー:
    1. リクエストからメッセージと会話履歴を取得
    2. Gemini にメッセージを送信（Function Calling で API が自動呼び出しされる）
    3. ルートデータがあれば Google Maps ディープリンクを付与
    4. AI応答テキスト + ルート + スポットをまとめて返却
    """
    serializer = ChatRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    message: str = serializer.validated_data["message"]
    history: list[dict[str, str]] = serializer.validated_data.get("history", [])

    try:
        reply_text, route_data, places_data = send_message(message, history)
    except Exception:
        logger.exception("Gemini API call failed")
        return Response(
            {
                "detail": "AIとの通信に失敗しました。しばらく待ってから再度お試しください。"
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # ルート計算成功時 → ディープリンクを付与 / エラー時 → null にする
    if route_data and "error" not in route_data:
        route_data = _attach_deep_link(route_data)
    elif route_data and "error" in route_data:
        route_data = None

    result = {
        "reply": reply_text,
        "route": route_data,
        "places": places_data,
    }

    return Response(ChatResponseSerializer(result).data)


@extend_schema(
    summary="帰路ルート生成",
    description="経由地を逆順にした帰りのルートを計算。",
    request=ReturnRouteRequestSerializer,
    responses={200: ReturnRouteResponseSerializer},
)
@api_view(["POST"])
def return_route(request: Request) -> Response:
    """帰路ルート生成エンドポイント。

    行きのルート情報をそのまま受け取り、以下の変換を行って Routes API を再呼び出しする:
    - origin ⇔ destination を入れ替え
    - waypoints の順序を反転（逆順）
    AI は介さず、確定的にルートを計算する。
    """
    serializer = ReturnRouteRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # 行きの destination を帰りの origin に、行きの origin を帰りの destination に入れ替え
    origin: str = serializer.validated_data["destination"]
    destination: str = serializer.validated_data["origin"]
    waypoints: list[str] = list(reversed(serializer.validated_data["waypoints"]))

    route_data = calculate_route(origin, destination, waypoints)

    if "error" in route_data:
        return Response(
            {"detail": route_data["error"]},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    route_data = _attach_deep_link(route_data)

    return Response(ReturnRouteResponseSerializer({"route": route_data}).data)
