from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response


@extend_schema(
    summary="ヘルスチェック",
    description="API の稼働状態を確認します",
    responses={
        200: {
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "message": {"type": "string"},
            },
        }
    },
)
@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok", "message": "寄り道マップ API"})
