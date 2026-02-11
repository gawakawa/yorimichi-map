"""navigation アプリの設定。

AI Drive Buddy のルート案内・スポット検索機能を提供する Django アプリ。
Vertex AI Gemini と Google Maps API を連携して、
チャット形式でドライブルートの提案を行う。
"""

from django.apps import AppConfig


class NavigationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "navigation"
