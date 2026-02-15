"""navigation アプリの URL 設定。

エンドポイント:
  POST /api/navigation/chat/             - AI チャット（Gemini Function Calling でルート・スポット自動検索）
  POST /api/navigation/return-route/     - 帰路ルート生成（出発地⇔目的地を入れ替え、経由地を逆順）
  POST /api/navigation/suggest-waypoints/ - 経由地候補提案（AI が3件提案）
  POST /api/navigation/calculate-route/  - ルート計算（AI 不使用、直接 Routes API 呼び出し）
"""

from django.urls import path

from . import views

urlpatterns = [
    path("chat/", views.chat, name="navigation-chat"),
    path("return-route/", views.return_route, name="navigation-return-route"),
    path(
        "suggest-waypoints/",
        views.suggest_waypoints_view,
        name="navigation-suggest-waypoints",
    ),
    path(
        "calculate-route/",
        views.calculate_route_view,
        name="navigation-calculate-route",
    ),
]
