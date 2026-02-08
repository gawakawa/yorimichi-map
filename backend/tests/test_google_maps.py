"""google_maps サービスのユニットテスト（モック使用）。"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch

import django
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0, str(backend_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yorimichi_map_backend.settings")
django.setup()

import requests  # noqa: E402
from django.conf import settings  # noqa: E402

from navigation.services.google_maps import (  # noqa: E402
    calculate_route,
    search_places,
)


# ---------------------------------------------------------------------------
# search_places
# ---------------------------------------------------------------------------


class TestSearchPlaces:
    """search_places のユニットテスト。"""

    @patch("navigation.services.google_maps.requests.post")
    def test_success(self, mock_post: Mock) -> None:
        """正常なレスポンスからスポット情報を抽出できること。"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            "places": [
                {
                    "displayName": {"text": "テストレストラン"},
                    "formattedAddress": "東京都千代田区丸の内1-1",
                    "rating": 4.5,
                    "userRatingCount": 100,
                    "location": {"latitude": 35.6812, "longitude": 139.7671},
                    "priceLevel": "PRICE_LEVEL_MODERATE",
                },
            ]
        }
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = search_places("東京駅", "restaurant")

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "テストレストラン"
        assert result[0]["address"] == "東京都千代田区丸の内1-1"
        assert result[0]["rating"] == 4.5
        assert result[0]["coords"]["latitude"] == 35.6812
        assert result[0]["coords"]["longitude"] == 139.7671

    @patch("navigation.services.google_maps.requests.post")
    def test_empty_response(self, mock_post: Mock) -> None:
        """結果が0件の場合、空リストを返すこと。"""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {"places": []}
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = search_places("存在しない場所")

        assert isinstance(result, list)
        assert len(result) == 0

    def test_no_api_key(self) -> None:
        """MAPS_API_KEY が未設定の場合、エラー辞書を返すこと。"""
        settings.MAPS_API_KEY = ""
        result = search_places("箱根", "restaurant")

        assert isinstance(result, dict)
        assert "error" in result

    @patch("navigation.services.google_maps.requests.post")
    def test_network_error(self, mock_post: Mock) -> None:
        """ネットワークエラー時にエラー辞書を返すこと。"""
        mock_post.side_effect = requests.ConnectionError("接続エラー")

        settings.MAPS_API_KEY = "test-api-key"
        result = search_places("東京駅")

        assert isinstance(result, dict)
        assert "error" in result

    @patch("navigation.services.google_maps.requests.post")
    def test_http_error(self, mock_post: Mock) -> None:
        """HTTP 4xx/5xx エラー時にエラー辞書を返すこと。"""
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("403 Forbidden")
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = search_places("東京駅")

        assert isinstance(result, dict)
        assert "error" in result

    @patch("navigation.services.google_maps.requests.post")
    def test_missing_fields_handled(self, mock_post: Mock) -> None:
        """APIレスポンスにフィールドが欠けていてもデフォルト値で処理できること。"""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            "places": [
                {
                    # displayName, location 等が欠落
                }
            ]
        }
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = search_places("箱根")

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "不明"
        assert result[0]["coords"]["latitude"] == 0


# ---------------------------------------------------------------------------
# calculate_route
# ---------------------------------------------------------------------------


class TestCalculateRoute:
    """calculate_route のユニットテスト。"""

    @patch("navigation.services.google_maps.requests.post")
    def test_success_basic(self, mock_post: Mock) -> None:
        """基本的なルート計算が成功すること。"""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            "routes": [
                {
                    "duration": "3600s",
                    "distanceMeters": 50000,
                    "polyline": {"encodedPolyline": "abc123"},
                    "travelAdvisory": {
                        "tollInfo": {
                            "estimatedPrice": [{"currencyCode": "JPY", "units": "1200"}]
                        }
                    },
                }
            ]
        }
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = calculate_route("東京駅", "横浜駅")

        assert "error" not in result
        assert result["origin"] == "東京駅"
        assert result["destination"] == "横浜駅"
        assert result["duration_seconds"] == "3600s"
        assert result["distance_meters"] == 50000
        assert result["encoded_polyline"] == "abc123"
        assert result["tolls"] == [{"currencyCode": "JPY", "units": "1200"}]

    @patch("navigation.services.google_maps.requests.post")
    def test_success_with_waypoints(self, mock_post: Mock) -> None:
        """経由地付きのルート計算が成功すること。"""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            "routes": [
                {
                    "duration": "7200s",
                    "distanceMeters": 100000,
                    "polyline": {"encodedPolyline": "xyz789"},
                }
            ]
        }
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = calculate_route("東京駅", "箱根湯本駅", waypoints=["小田原駅"])

        assert "error" not in result
        assert result["waypoints"] == ["小田原駅"]

        # intermediates がリクエストに含まれていること
        call_kwargs = mock_post.call_args
        payload = call_kwargs.kwargs.get("json") or call_kwargs[1].get("json")
        assert payload["intermediates"] == [{"address": "小田原駅"}]

    def test_no_api_key(self) -> None:
        """MAPS_API_KEY が未設定の場合、エラー辞書を返すこと。"""
        settings.MAPS_API_KEY = ""
        result = calculate_route("東京駅", "横浜駅")

        assert "error" in result

    @patch("navigation.services.google_maps.requests.post")
    def test_no_routes_found(self, mock_post: Mock) -> None:
        """ルートが見つからない場合にエラーを返すこと。"""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {"routes": []}
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = calculate_route("無効な場所A", "無効な場所B")

        assert "error" in result
        assert "見つかりませんでした" in result["error"]

    @patch("navigation.services.google_maps.requests.post")
    def test_network_error(self, mock_post: Mock) -> None:
        """ネットワークエラー時にエラー辞書を返すこと。"""
        mock_post.side_effect = requests.Timeout("タイムアウト")

        settings.MAPS_API_KEY = "test-api-key"
        result = calculate_route("東京駅", "横浜駅")

        assert "error" in result

    @patch("navigation.services.google_maps.requests.post")
    def test_no_toll_info(self, mock_post: Mock) -> None:
        """高速料金情報がない場合でも正常に処理できること。"""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            "routes": [
                {
                    "duration": "1800s",
                    "distanceMeters": 25000,
                    "polyline": {"encodedPolyline": "def456"},
                }
            ]
        }
        mock_post.return_value = mock_response

        settings.MAPS_API_KEY = "test-api-key"
        result = calculate_route("A", "B")

        assert result["tolls"] == []
