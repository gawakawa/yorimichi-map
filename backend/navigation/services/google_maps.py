from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText"
ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"


def search_places(
    location_query: str, place_type: str = "restaurant"
) -> list[dict[str, Any]] | dict[str, str]:
    """Places API (New) で周辺スポットを検索する。"""
    api_key = settings.MAPS_API_KEY
    if not api_key:
        return {"error": "MAPS_API_KEY が設定されていません"}

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
        "minRating": 4.0,
        "maxResultCount": 3,
    }

    try:
        response = requests.post(
            PLACES_API_URL, json=payload, headers=headers, timeout=10
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        logger.exception("Places API request failed")
        return {"error": "スポット検索に失敗しました。ネットワークを確認してください。"}

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
    """Routes API v2 でルートを計算する。"""
    api_key = settings.MAPS_API_KEY
    if not api_key:
        return {"error": "MAPS_API_KEY が設定されていません"}

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

    intermediates = []
    if waypoints:
        intermediates = [{"address": wp} for wp in waypoints]

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
            ROUTES_API_URL, json=payload, headers=headers, timeout=15
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        logger.exception("Routes API request failed")
        return {"error": "ルート計算に失敗しました。ネットワークを確認してください。"}

    routes = data.get("routes", [])
    if not routes:
        return {"error": "ルートが見つかりませんでした。地名を確認してください。"}

    route = routes[0]

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
