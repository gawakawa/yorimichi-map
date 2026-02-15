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


class TestSuggestWaypointsEndpoint:
    """POST /api/navigation/suggest-waypoints/ のユニットテスト。"""

    @pytest.fixture(autouse=True)
    def _allow_all_hosts(self):
        original = settings.ALLOWED_HOSTS
        settings.ALLOWED_HOSTS = ["*"]
        yield
        settings.ALLOWED_HOSTS = original

    @pytest.fixture()
    def client(self):
        return Client()

    @patch("navigation.views.suggest_waypoints")
    def test_suggest_waypoints_success(self, mock_suggest, client) -> None:
        """正常な候補提案リクエストが 200 を返すこと。"""
        mock_suggest.return_value = {
            "candidates": [
                {
                    "name": "箱根温泉",
                    "description": "歴史ある温泉地。露天風呂が人気。",
                    "address": "神奈川県足柄下郡箱根町",
                },
                {
                    "name": "熱海温泉",
                    "description": "海を望む温泉リゾート。",
                    "address": "静岡県熱海市",
                },
                {
                    "name": "湯河原温泉",
                    "description": "万葉集にも詠まれた古湯。",
                    "address": "神奈川県足柄下郡湯河原町",
                },
            ],
            "ai_comment": "箱根・熱海方面には多くの温泉があります！",
        }

        response = client.post(
            "/api/navigation/suggest-waypoints/",
            data=json.dumps(
                {
                    "origin": "東京駅",
                    "destination": "名古屋駅",
                    "prompt": "途中で温泉に寄りたい",
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["candidates"]) == 3
        assert data["candidates"][0]["name"] == "箱根温泉"
        assert "ai_comment" in data

    @patch("navigation.views.suggest_waypoints")
    def test_suggest_waypoints_rate_limit(self, mock_suggest, client) -> None:
        """レート制限時に 429 を返すこと。"""
        mock_suggest.return_value = {
            "candidates": [],
            "ai_comment": "サーバーが混み合っています。",
            "error": "rate_limit",
        }

        response = client.post(
            "/api/navigation/suggest-waypoints/",
            data=json.dumps(
                {
                    "origin": "東京駅",
                    "destination": "大阪駅",
                    "prompt": "美味しいラーメン",
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 429

    @patch("navigation.views.suggest_waypoints")
    def test_suggest_waypoints_api_error(self, mock_suggest, client) -> None:
        """API エラー時に 503 を返すこと。"""
        mock_suggest.side_effect = Exception("API Error")

        response = client.post(
            "/api/navigation/suggest-waypoints/",
            data=json.dumps(
                {
                    "origin": "東京駅",
                    "destination": "大阪駅",
                    "prompt": "カフェ",
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 503

    def test_suggest_waypoints_missing_fields(self, client) -> None:
        """必須フィールドがない場合に 400 を返すこと。"""
        response = client.post(
            "/api/navigation/suggest-waypoints/",
            data=json.dumps({"origin": "東京駅"}),
            content_type="application/json",
        )

        assert response.status_code == 400


class TestCalculateRouteEndpoint:
    """POST /api/navigation/calculate-route/ のユニットテスト。"""

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
    def test_calculate_route_success(self, mock_calculate_route, client) -> None:
        """正常なルート計算が 200 を返すこと。"""
        mock_calculate_route.return_value = {
            "origin": "東京駅",
            "destination": "横浜駅",
            "waypoints": ["鎌倉"],
            "duration_seconds": "5400s",
            "distance_meters": 60000,
            "encoded_polyline": "abc123",
            "tolls": [],
        }

        response = client.post(
            "/api/navigation/calculate-route/",
            data=json.dumps(
                {
                    "origin": "東京駅",
                    "destination": "横浜駅",
                    "waypoints": ["鎌倉"],
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert data["route"]["origin"] == "東京駅"
        assert data["route"]["destination"] == "横浜駅"
        assert "google_maps_url" in data["route"]
        mock_calculate_route.assert_called_once_with("東京駅", "横浜駅", ["鎌倉"])

    @patch("navigation.views.calculate_route")
    def test_calculate_route_without_waypoints(
        self, mock_calculate_route, client
    ) -> None:
        """経由地なしでルート計算が正常に動作すること。"""
        mock_calculate_route.return_value = {
            "origin": "東京駅",
            "destination": "横浜駅",
            "waypoints": [],
            "duration_seconds": "3600s",
            "distance_meters": 50000,
            "encoded_polyline": "xyz",
            "tolls": [],
        }

        response = client.post(
            "/api/navigation/calculate-route/",
            data=json.dumps(
                {
                    "origin": "東京駅",
                    "destination": "横浜駅",
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 200
        mock_calculate_route.assert_called_once_with("東京駅", "横浜駅", [])

    @patch("navigation.views.calculate_route")
    def test_calculate_route_not_found(self, mock_calculate_route, client) -> None:
        """ルートが見つからない場合に 400 を返すこと。"""
        mock_calculate_route.return_value = {
            "error": "ルートが見つかりませんでした。",
            "error_type": "not_found",
        }

        response = client.post(
            "/api/navigation/calculate-route/",
            data=json.dumps(
                {
                    "origin": "存在しない地名",
                    "destination": "存在しない地名2",
                }
            ),
            content_type="application/json",
        )

        assert response.status_code == 400

    def test_calculate_route_missing_fields(self, client) -> None:
        """必須フィールドがない場合に 400 を返すこと。"""
        response = client.post(
            "/api/navigation/calculate-route/",
            data=json.dumps({"origin": "東京駅"}),
            content_type="application/json",
        )

        assert response.status_code == 400
