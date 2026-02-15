"""navigation API の Request / Response シリアライザ定義。

drf-spectacular と連携し、OpenAPI スキーマ（/api/docs/）を自動生成する。
フロントエンドとの型契約（API コントラクト）をここで一元管理している。
"""

from rest_framework import serializers


# --- チャット関連 ---


class ChatMessageSerializer(serializers.Serializer):
    """チャット履歴の1メッセージ。role は "user" または "assistant"。"""

    role = serializers.ChoiceField(choices=["user", "assistant"])
    content = serializers.CharField()


class ChatRequestSerializer(serializers.Serializer):
    """POST /api/navigation/chat/ のリクエストボディ。

    message: ユーザーの入力テキスト
    history: これまでの会話履歴（フロントエンドが保持して毎回送る）
    """

    message = serializers.CharField(help_text="ユーザーのメッセージ")
    history = ChatMessageSerializer(many=True, required=False, default=[])


# --- 地理座標・スポット ---


class CoordsSerializer(serializers.Serializer):
    """緯度・経度の座標ペア。"""

    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class PlaceSerializer(serializers.Serializer):
    """Places API で取得したスポット情報。"""

    name = serializers.CharField()
    address = serializers.CharField()
    rating = serializers.FloatField()
    coords = CoordsSerializer()
    price_level = serializers.CharField()


# --- ルート ---


class TollSerializer(serializers.Serializer):
    """高速道路料金の通貨コードと金額。"""

    currencyCode = serializers.CharField()  # noqa: N815
    units = serializers.CharField()


class RouteSerializer(serializers.Serializer):
    """Routes API で計算したルート情報。

    encoded_polyline は Google Encoded Polyline 形式の文字列。
    フロントエンドでデコードして地図上にポリラインを描画する。
    google_maps_url は Google Maps アプリを開くためのディープリンク。
    waypoint_coords は経由地の座標リスト（マップ上にマーカーを表示するため）。
    """

    origin = serializers.CharField()
    destination = serializers.CharField()
    waypoints = serializers.ListField(child=serializers.CharField())
    waypoint_coords = CoordsSerializer(many=True, required=False, default=[])
    duration_seconds = serializers.CharField()
    distance_meters = serializers.IntegerField()
    encoded_polyline = serializers.CharField()
    tolls = TollSerializer(many=True, required=False, default=[])
    google_maps_url = serializers.CharField()


# --- レスポンス ---


class ChatResponseSerializer(serializers.Serializer):
    """POST /api/navigation/chat/ のレスポンスボディ。

    reply: AI の応答テキスト
    route: Gemini が calculate_route を呼んだ場合にルートデータが入る（それ以外は null）
    places: Gemini が search_places を呼んだ場合にスポット一覧が入る（それ以外は null）
    """

    reply = serializers.CharField()
    route = RouteSerializer(required=False, allow_null=True)
    places = PlaceSerializer(many=True, required=False, allow_null=True)


class ReturnRouteRequestSerializer(serializers.Serializer):
    """POST /api/navigation/return-route/ のリクエストボディ。

    行きのルート情報をそのまま渡す。
    ビューで origin ⇔ destination を入れ替え、waypoints を逆順にして帰路を計算する。
    """

    origin = serializers.CharField()
    destination = serializers.CharField()
    waypoints = serializers.ListField(child=serializers.CharField())


class ReturnRouteResponseSerializer(serializers.Serializer):
    """POST /api/navigation/return-route/ のレスポンスボディ。"""

    route = RouteSerializer()


# --- 経由地候補提案 ---


class WaypointCandidateSerializer(serializers.Serializer):
    """AI が提案する経由地候補1件。"""

    name = serializers.CharField()
    description = serializers.CharField()
    address = serializers.CharField(required=False, allow_blank=True, default="")
    coords = CoordsSerializer(required=False, allow_null=True, default=None)


class WaypointSuggestRequestSerializer(serializers.Serializer):
    """POST /api/navigation/suggest-waypoints/ のリクエストボディ。"""

    origin = serializers.CharField(help_text="出発地")
    destination = serializers.CharField(help_text="目的地")
    prompt = serializers.CharField(help_text="寄り道リクエスト（例: 途中で温泉に寄りたい）")


class WaypointSuggestResponseSerializer(serializers.Serializer):
    """POST /api/navigation/suggest-waypoints/ のレスポンスボディ。"""

    candidates = WaypointCandidateSerializer(many=True)
    ai_comment = serializers.CharField(required=False, allow_blank=True, default="")


class CalculateRouteRequestSerializer(serializers.Serializer):
    """POST /api/navigation/calculate-route/ のリクエストボディ。"""

    origin = serializers.CharField(help_text="出発地")
    destination = serializers.CharField(help_text="目的地")
    waypoints = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=[],
        help_text="経由地のリスト",
    )


class CalculateRouteResponseSerializer(serializers.Serializer):
    """POST /api/navigation/calculate-route/ のレスポンスボディ。"""

    route = RouteSerializer()
