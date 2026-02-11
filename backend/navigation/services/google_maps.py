"""Google Maps API クライアント（Places API / Routes API）。

このモジュールは Gemini の Function Calling から自動的に呼び出される。
Gemini がユーザーの要望を解析し、必要に応じて search_places() や calculate_route() を
ツールとして実行する。

API キーは settings.MAPS_API_KEY から取得する（環境変数 MAPS_API_KEY で設定）。
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# Google Maps API (New) のエンドポイント
PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText"
ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"


def _get_api_key() -> str | None:
    """API キーを取得し、未設定の場合はエラーログを記録して None を返す。"""
    api_key = settings.MAPS_API_KEY
    if not api_key:
        logger.error("MAPS_API_KEY is not configured")
        return None
    return api_key


def search_places(
    location_query: str, place_type: str = "restaurant"
) -> list[dict[str, Any]] | dict[str, str]:
    """Places API (New) の textSearch で周辺スポットを検索する。

    Args:
        location_query: 検索する場所やエリア名（例: "箱根", "東京駅周辺"）
        place_type: 検索する施設の種類（例: "restaurant", "cafe"）

    Returns:
        スポット情報のリスト。エラー時は {"error": "..."} の辞書を返す。

    フィルタ条件:
        - minRating=settings.PLACES_MIN_RATING（デフォルト: 星4以上の高評価のみ）
        - maxResultCount=settings.PLACES_MAX_RESULTS（デフォルト: 最大3件）
    """
    api_key = _get_api_key()
    if not api_key:
        return {
            "error": "サービスの設定に問題があります。管理者にお問い合わせください。"
        }

    # レスポンスに含めるフィールドを指定（FieldMask）
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.rating,"
            "places.userRatingCount,"
            "places.location,"
            "places.priceLevel"
        ),
    }

    payload = {
        "textQuery": f"{place_type} near {location_query}",
        "minRating": settings.PLACES_MIN_RATING,
        "maxResultCount": settings.PLACES_MAX_RESULTS,
    }

    try:
        response = requests.post(
            PLACES_API_URL,
            json=payload,
            headers=headers,
            timeout=settings.PLACES_API_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.HTTPError as e:
        if e.response is not None and e.response.status_code == 429:
            logger.warning("Places API rate limit exceeded")
            return {
                "error": "リクエストが集中しています。しばらく待ってから再度お試しください。"
            }
        logger.exception("Places API request failed")
        return {"error": "スポット検索に失敗しました。ネットワークを確認してください。"}
    except requests.RequestException:
        logger.exception("Places API request failed")
        return {"error": "スポット検索に失敗しました。ネットワークを確認してください。"}

    # API レスポンスからフロントエンド向けの形式に変換
    places = data.get("places", [])
    results: list[dict[str, Any]] = []
    for place in places:
        display_name = place.get("displayName", {})
        location = place.get("location", {})
        results.append(
            {
                "name": display_name.get("text", "不明"),
                "address": place.get("formattedAddress", "不明"),
                "rating": place.get("rating", 0),
                "coords": {
                    "latitude": location.get("latitude", 0),
                    "longitude": location.get("longitude", 0),
                },
                "price_level": place.get("priceLevel", "UNKNOWN"),
            }
        )

    return results


def calculate_route(
    origin: str, destination: str, waypoints: list[str] | None = None
) -> dict[str, Any]:
    """Routes API v2 でドライブルートを計算する。

    Args:
        origin: 出発地（例: "東京駅"）
        destination: 目的地（例: "箱根湯本駅"）
        waypoints: 経由地のリスト（省略可）

    Returns:
        ルート情報の辞書。エラー時は {"error": "..."} を返す。

    ルート計算の設定:
        - travelMode: DRIVE（自動車）
        - routingPreference: TRAFFIC_AWARE（交通状況を考慮）
        - extraComputations: TOLLS（高速道路料金を算出）
        - departureTime: 現在時刻+5分（リアルタイム交通情報の取得用）
    """
    api_key = _get_api_key()
    if not api_key:
        return {
            "error": "サービスの設定に問題があります。管理者にお問い合わせください。"
        }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "routes.duration,"
            "routes.distanceMeters,"
            "routes.travelAdvisory.tollInfo,"
            "routes.polyline.encodedPolyline"
        ),
    }

    # 経由地を Routes API の intermediates 形式に変換
    intermediates = []
    if waypoints:
        intermediates = [{"address": wp} for wp in waypoints]

    # 出発時刻は現在時刻の5分後（交通情報取得のため少し未来にする）
    departure_time = (datetime.now(tz=UTC) + timedelta(minutes=5)).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    payload: dict[str, Any] = {
        "origin": {"address": origin},
        "destination": {"address": destination},
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "extraComputations": ["TOLLS"],
        "departureTime": departure_time,
    }

    if intermediates:
        payload["intermediates"] = intermediates

    try:
        response = requests.post(
            ROUTES_API_URL,
            json=payload,
            headers=headers,
            timeout=settings.ROUTES_API_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.HTTPError as e:
        if e.response is not None and e.response.status_code == 429:
            logger.warning("Routes API rate limit exceeded")
            return {
                "error": "リクエストが集中しています。しばらく待ってから再度お試しください。",
                "error_type": "rate_limit",
            }
        logger.exception("Routes API request failed")
        return {
            "error": "ルート計算に失敗しました。ネットワークを確認してください。",
            "error_type": "api_failure",
        }
    except requests.RequestException:
        logger.exception("Routes API request failed")
        return {
            "error": "ルート計算に失敗しました。ネットワークを確認してください。",
            "error_type": "api_failure",
        }

    routes = data.get("routes", [])
    if not routes:
        return {
            "error": "ルートが見つかりませんでした。地名を確認してください。",
            "error_type": "not_found",
        }

    route = routes[0]

    # 高速道路料金を取り出す
    tolls: list[dict[str, str]] = []
    toll_info = (
        route.get("travelAdvisory", {}).get("tollInfo", {}).get("estimatedPrice", [])
    )
    for price in toll_info:
        tolls.append(
            {
                "currencyCode": price.get("currencyCode", "JPY"),
                "units": price.get("units", "0"),
            }
        )

    return {
        "origin": origin,
        "destination": destination,
        "waypoints": waypoints or [],
        "duration_seconds": route.get("duration", "0s"),
        "distance_meters": route.get("distanceMeters", 0),
        "encoded_polyline": route.get("polyline", {}).get("encodedPolyline", ""),
        "tolls": tolls,
    }
