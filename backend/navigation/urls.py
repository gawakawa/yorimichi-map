"""navigation アプリの URL 設定。

エンドポイント:
  POST /api/navigation/chat/         - AI チャット（Gemini Function Calling でルート・スポット自動検索）
  POST /api/navigation/return-route/ - 帰路ルート生成（出発地⇔目的地を入れ替え、経由地を逆順）
"""

from django.urls import path

from . import views

urlpatterns = [
    path("chat/", views.chat, name="navigation-chat"),
    path("return-route/", views.return_route, name="navigation-return-route"),
]
