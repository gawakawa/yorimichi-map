"""外部 API 疎通テスト。

モックを使わず、実際に外部 API へリクエストを送信して
レスポンスが正しく返ってくることを確認する。

実行方法:
    cd backend
    direnv exec . python -m pytest tests/test_integration.py -v -s

前提条件:
    - backend/.env に MAPS_API_KEY, GOOGLE_CLOUD_PROJECT を設定済み
    - gcloud auth application-default login 実行済み（Vertex AI 用）
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import django
from dotenv import load_dotenv

# Django 設定の初期化
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0, str(backend_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yorimichi_map_backend.settings")
django.setup()

import json  # noqa: E402

import pytest  # noqa: E402
from django.conf import settings  # noqa: E402

# ---------------------------------------------------------------------------
# 1. Places API (New) 疎通テスト
# ---------------------------------------------------------------------------


class TestPlacesAPI:
    """Google Places API (New) の疎通テスト。"""

    def test_search_places_returns_results(self) -> None:
        """search_places が実際のスポット情報を返すことを確認する。"""
        from navigation.services.google_maps import search_places

        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

        results = search_places(location_query="東京駅", place_type="restaurant")

        # エラーでないこと
        assert isinstance(results, list), f"エラーが返されました: {results}"
        assert len(results) > 0, "結果が0件です"

        # 各スポットに必須フィールドがあること
        for place in results:
            assert "name" in place, f"name フィールドがありません: {place}"
            assert "address" in place, f"address フィールドがありません: {place}"
            assert "coords" in place, f"coords フィールドがありません: {place}"
            assert "latitude" in place["coords"]
            assert "longitude" in place["coords"]

        print(f"\n[Places API] 成功: {len(results)} 件のスポットを取得")
        for p in results:
            print(f"  - {p['name']} ({p['address']}) 評価: {p.get('rating', 'N/A')}")

    def test_search_places_with_different_type(self) -> None:
        """異なる place_type でも結果が返ることを確認する。"""
        from navigation.services.google_maps import search_places

        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

        results = search_places(location_query="箱根", place_type="tourist_attraction")

        assert isinstance(results, list), f"エラーが返されました: {results}"
        print(f"\n[Places API] 成功 (観光地): {len(results)} 件")
        for p in results:
            print(f"  - {p['name']}")


# ---------------------------------------------------------------------------
# 2. Routes API v2 疎通テスト
# ---------------------------------------------------------------------------


class TestRoutesAPI:
    """Google Routes API v2 の疎通テスト。"""

    def test_calculate_route_basic(self) -> None:
        """基本的なルート計算が成功することを確認する。"""
        from navigation.services.google_maps import calculate_route

        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

        result = calculate_route(origin="東京駅", destination="横浜駅")

        assert "error" not in result, f"エラーが返されました: {result}"
        assert "duration_seconds" in result
        assert "distance_meters" in result
        assert "encoded_polyline" in result
        assert result["distance_meters"] > 0

        print("\n[Routes API] 成功: 東京駅 → 横浜駅")
        print(f"  所要時間: {result['duration_seconds']}")
        print(f"  距離: {result['distance_meters']} m")
        print(f"  高速料金: {result.get('tolls', [])}")

    def test_calculate_route_with_waypoints(self) -> None:
        """経由地付きのルート計算が成功することを確認する。"""
        from navigation.services.google_maps import calculate_route

        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

        result = calculate_route(
            origin="東京駅",
            destination="箱根湯本駅",
            waypoints=["小田原駅"],
        )

        assert "error" not in result, f"エラーが返されました: {result}"
        assert result["distance_meters"] > 0
        assert result["waypoints"] == ["小田原駅"]

        print("\n[Routes API] 成功: 東京駅 → 小田原駅(経由) → 箱根湯本駅")
        print(f"  所要時間: {result['duration_seconds']}")
        print(f"  距離: {result['distance_meters']} m")


# ---------------------------------------------------------------------------
# 3. Vertex AI Gemini 疎通テスト
# ---------------------------------------------------------------------------


class TestGeminiAPI:
    """Vertex AI Gemini の疎通テスト。"""

    def test_gemini_simple_message(self) -> None:
        """Gemini にシンプルなメッセージを送信して応答が返ることを確認する。"""
        from navigation.services.gemini import send_message

        if not settings.GOOGLE_CLOUD_PROJECT:
            pytest.skip("GOOGLE_CLOUD_PROJECT が未設定")

        reply_text, route_data, places_data = send_message(
            message="こんにちは、ドライブの相談をしたいです。",
            history=[],
        )

        assert reply_text, "応答テキストが空です"
        assert isinstance(reply_text, str)

        print("\n[Gemini] 成功: 応答テキストを取得")
        print(f"  応答: {reply_text[:200]}...")

    def test_gemini_function_calling_places(self) -> None:
        """Gemini が search_places を自動呼び出しすることを確認する。"""
        from navigation.services.gemini import send_message

        if not settings.GOOGLE_CLOUD_PROJECT:
            pytest.skip("GOOGLE_CLOUD_PROJECT が未設定")
        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

        reply_text, route_data, places_data = send_message(
            message="東京駅の近くで美味しいラーメン屋を教えて",
            history=[],
        )

        assert reply_text, "応答テキストが空です"
        # Gemini がツールを呼んだ場合、places_data に結果が入る
        print("\n[Gemini + Places] 成功")
        print(f"  応答: {reply_text[:200]}...")
        if places_data:
            print(f"  取得スポット数: {len(places_data)}")
            for p in places_data:
                print(f"    - {p.get('name', '不明')}")
        else:
            print("  (Gemini がツールを呼ばなかった可能性があります)")

    def test_gemini_function_calling_route(self) -> None:
        """Gemini が calculate_route を自動呼び出しすることを確認する。"""
        from navigation.services.gemini import send_message

        if not settings.GOOGLE_CLOUD_PROJECT:
            pytest.skip("GOOGLE_CLOUD_PROJECT が未設定")
        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

        reply_text, route_data, places_data = send_message(
            message="東京駅から箱根湯本駅までドライブしたい。ルートを教えて。",
            history=[],
        )

        assert reply_text, "応答テキストが空です"
        print("\n[Gemini + Routes] 成功")
        print(f"  応答: {reply_text[:200]}...")
        if route_data:
            print(
                f"  ルート: {route_data.get('origin')} → {route_data.get('destination')}"
            )
            print(f"  距離: {route_data.get('distance_meters')} m")
        else:
            print("  (Gemini がルート計算ツールを呼ばなかった可能性があります)")


# ---------------------------------------------------------------------------
# 4. Deep Link 生成テスト（外部API不要・ロジックのみ）
# ---------------------------------------------------------------------------


class TestDeepLink:
    """Google Maps ディープリンク URL 生成のテスト。"""

    def test_generate_url_basic(self) -> None:
        """基本的な URL 生成が正しく動作することを確認する。"""
        from navigation.services.deep_link import generate_google_maps_url

        url = generate_google_maps_url(origin="東京駅", destination="箱根湯本駅")

        assert "google.com/maps/dir" in url
        assert "travelmode=driving" in url
        print(f"\n[Deep Link] 成功: {url}")

    def test_generate_url_with_waypoints(self) -> None:
        """経由地付きの URL 生成が正しく動作することを確認する。"""
        from navigation.services.deep_link import generate_google_maps_url

        url = generate_google_maps_url(
            origin="東京駅",
            destination="箱根湯本駅",
            waypoints=["小田原駅", "熱海駅"],
        )

        assert "google.com/maps/dir" in url
        assert "waypoints=" in url
        print(f"\n[Deep Link] 成功 (経由地付き): {url}")


# ---------------------------------------------------------------------------
# 5. Django API エンドポイント疎通テスト
# ---------------------------------------------------------------------------


class TestDjangoEndpoints:
    """Django REST API エンドポイントの疎通テスト。"""

    @pytest.fixture(autouse=True)
    def _allow_all_hosts(self):
        original = settings.ALLOWED_HOSTS
        settings.ALLOWED_HOSTS = ["*"]
        yield
        settings.ALLOWED_HOSTS = original

    @pytest.fixture()
    def client(self):
        from django.test import Client

        return Client()

    def test_health_check(self, client) -> None:
        """ヘルスチェックエンドポイントが正常に応答することを確認する。"""
        response = client.get("/api/health/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"\n[Health Check] 成功: {data}")

    def test_chat_endpoint(self, client) -> None:
        """チャットエンドポイントが正常に応答することを確認する。"""
        if not settings.GOOGLE_CLOUD_PROJECT:
            pytest.skip("GOOGLE_CLOUD_PROJECT が未設定")

        response = client.post(
            "/api/navigation/chat/",
            data=json.dumps(
                {
                    "message": "こんにちは",
                    "history": [],
                }
            ),
            content_type="application/json",
        )
        assert response.status_code == 200, (
            f"ステータス: {response.status_code}, 内容: {response.content}"
        )
        data = response.json()
        assert "reply" in data
        print(f"\n[Chat API] 成功: {data['reply'][:100]}...")

    def test_return_route_endpoint(self, client) -> None:
        """帰りルート計算エンドポイントが正常に応答することを確認する。"""
        if not settings.MAPS_API_KEY:
            pytest.skip("MAPS_API_KEY が未設定")

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
        assert response.status_code == 200, (
            f"ステータス: {response.status_code}, 内容: {response.content}"
        )
        data = response.json()
        assert "route" in data
        assert "error" not in data["route"]
        print(
            f"\n[Return Route API] 成功: {json.dumps(data['route'], ensure_ascii=False)[:200]}"
        )
