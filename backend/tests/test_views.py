"""navigation views のユニットテスト（モック使用）。"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from unittest.mock import patch

import django
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0, str(backend_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yorimichi_map_backend.settings")
django.setup()

import pytest  # noqa: E402
from django.conf import settings  # noqa: E402
from django.test import Client  # noqa: E402


class TestChatEndpoint:
    """POST /api/navigation/chat/ のユニットテスト。"""

    @pytest.fixture(autouse=True)
    def _allow_all_hosts(self):
        original = settings.ALLOWED_HOSTS
        settings.ALLOWED_HOSTS = ["*"]
        yield
        settings.ALLOWED_HOSTS = original

    @pytest.fixture()
    def client(self):
        return Client()

    @patch("navigation.views.send_message")
    def test_chat_success(self, mock_send_message, client) -> None:
        """正常なチャットリクエストが 200 を返すこと。"""
        mock_send_message.return_value = ("こんにちは！", None, None)

        response = client.post(
            "/api/navigation/chat/",
            data=json.dumps({"message": "こんにちは", "history": []}),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert data["reply"] == "こんにちは！"
        assert data["route"] is None
        assert data["places"] is None

    @patch("navigation.views.send_message")
    def test_chat_with_route_data(self, mock_send_message, client) -> None:
        """ルートデータ付きの応答が正しくシリアライズされること。"""
        mock_send_message.return_value = (
            "ルートが見つかりました！",
            {
                "origin": "東京駅",
                "destination": "横浜駅",
                "waypoints": [],
                "duration_seconds": "3600s",
                "distance_meters": 50000,
                "encoded_polyline": "abc123",
                "tolls": [],
            },
            None,
        )

        response = client.post(
            "/api/navigation/chat/",
            data=json.dumps({"message": "東京から横浜へ", "history": []}),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert data["route"] is not None
        assert data["route"]["origin"] == "東京駅"
        assert "google_maps_url" in data["route"]

    @patch("navigation.views.send_message")
    def test_chat_gemini_error(self, mock_send_message, client) -> None:
        """Gemini API エラー時に 503 を返すこと。"""
        mock_send_message.side_effect = Exception("API Error")

        response = client.post(
            "/api/navigation/chat/",
            data=json.dumps({"message": "テスト", "history": []}),
            content_type="application/json",
        )

        assert response.status_code == 503

    def test_chat_missing_message(self, client) -> None:
        """message フィールドがない場合に 400 を返すこと。"""
        response = client.post(
            "/api/navigation/chat/",
            data=json.dumps({"history": []}),
            content_type="application/json",
        )

        assert response.status_code == 400


class TestReturnRouteEndpoint:
    """POST /api/navigation/return-route/ のユニットテスト。"""

    @pytest.fixture(autouse=True)
    def _allow_all_hosts(self):
        original = settings.ALLOWED_HOSTS
        settings.ALLOWED_HOSTS = ["*"]
        yield
        settings.ALLOWED_HOSTS = original

    @pytest.fixture()
    def client(self):
        return Client()

    @patch("navigation.views.calculate_route")
    def test_return_route_success(self, mock_calculate_route, client) -> None:
        """正常な帰路計算が 200 を返すこと。"""
        mock_calculate_route.return_value = {
            "origin": "横浜駅",
            "destination": "東京駅",
            "waypoints": [],
            "duration_seconds": "3600s",
            "distance_meters": 50000,
            "encoded_polyline": "abc123",
            "tolls": [],
        }

        response = client.post(
            "/api/navigation/return-route/",
            data=json.dumps(
                {
                    "origin": "東京駅",
                    "destination": "横浜駅",
                    "waypoints": [],
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert data["route"]["origin"] == "横浜駅"
        # origin と destination が入れ替わっていること
        mock_calculate_route.assert_called_once_with("横浜駅", "東京駅", [])

    @patch("navigation.views.calculate_route")
    def test_return_route_swaps_and_reverses(
        self, mock_calculate_route, client
    ) -> None:
        """origin/destination の入替と waypoints の逆順が正しいこと。"""
        mock_calculate_route.return_value = {
            "origin": "C",
            "destination": "A",
            "waypoints": ["B"],
            "duration_seconds": "1800s",
            "distance_meters": 25000,
            "encoded_polyline": "xyz",
            "tolls": [],
        }

        response = client.post(
            "/api/navigation/return-route/",
            data=json.dumps(
                {
                    "origin": "A",
                    "destination": "C",
                    "waypoints": ["B"],
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 200
        mock_calculate_route.assert_called_once_with("C", "A", ["B"])

    @patch("navigation.views.calculate_route")
    def test_return_route_api_error_returns_400(
        self, mock_calculate_route, client
    ) -> None:
        """ルート検索失敗（無効な地名等）が 400 を返すこと。"""
        mock_calculate_route.return_value = {
            "error": "ルートが見つかりませんでした。地名を確認してください。",
            "error_type": "not_found",
        }

        response = client.post(
            "/api/navigation/return-route/",
            data=json.dumps(
                {
                    "origin": "存在しない地名",
                    "destination": "存在しない地名2",
                    "waypoints": [],
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 400

    def test_return_route_missing_fields(self, client) -> None:
        """必須フィールドがない場合に 400 を返すこと。"""
        response = client.post(
            "/api/navigation/return-route/",
            data=json.dumps({"origin": "東京駅"}),
            content_type="application/json",
        )

        assert response.status_code == 400
