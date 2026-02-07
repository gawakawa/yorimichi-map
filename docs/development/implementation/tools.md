# 💻 tools.py - API連携ロジック

## 概要

**役割**: AIの「手足」となる部分。AIがここにある関数を呼び出します。

## 実装コード

```python
import os
import requests
import datetime
from dotenv import load_dotenv

load_dotenv()
MAPS_API_KEY = os.getenv("MAPS_API_KEY")

def search_places(location_query: str, place_type: str = "restaurant"):
    """
    指定された場所周辺の施設を検索します。

    Args:
        location_query: 場所の名前（例: "箱根湯本駅", "現在地周辺"）
        place_type: 施設のタイプ（例: "restaurant", "tourist_attraction"）

    Returns:
        施設情報のリスト（名前、住所、評価、座標、価格帯）
    """
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.priceLevel"
    }
    payload = {
        "textQuery": f"{place_type} near {location_query}",
        "minRating": 4.0,
        "maxResultCount": 3
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()

        results = []
        if "places" in data:
            for place in data["places"]:
                results.append({
                    "name": place.get("displayName", {}).get("text"),
                    "address": place.get("formattedAddress"),
                    "rating": place.get("rating", "N/A"),
                    "coords": place.get("location"),  # {latitude, longitude}
                    "price_level": place.get("priceLevel", "UNKNOWN")
                })
        return results
    except Exception as e:
        return {"error": str(e)}


def calculate_route(origin: str, destination: str, waypoints: list[str] = []):
    """
    出発地から目的地までのルート、料金、時間を計算します。

    Args:
        origin: 出発地の名称
        destination: 目的地の名称
        waypoints: 経由地の名称リスト

    Returns:
        ルート情報（所要時間、距離、通行料金、ポリライン）
    """
    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.travelAdvisory.tollInfo,routes.polyline.encodedPolyline"
    }

    # 経由地のデータ構造作成
    intermediates = [{"address": wp, "via": True} for wp in waypoints]

    payload = {
        "origin": {"address": origin},
        "destination": {"address": destination},
        "intermediates": intermediates,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "extraComputations": ["TOLLS"],
        "departureTime": (datetime.datetime.utcnow() + datetime.timedelta(minutes=5)).isoformat() + "Z"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()

        if "routes" not in data:
            return {"error": "ルートが見つかりませんでした。"}

        route = data["routes"][0]

        # 必要な情報だけ抽出
        summary = {
            "origin": origin,
            "destination": destination,
            "waypoints": waypoints,
            "duration_seconds": route.get("duration", "0s"),
            "distance_meters": route.get("distanceMeters", 0),
            "encoded_polyline": route.get("polyline", {}).get("encodedPolyline", ""),
            "tolls": route.get("travelAdvisory", {}).get("tollInfo", {}).get("estimatedPrice", [])
        }
        return summary
    except Exception as e:
        return {"error": str(e)}
```

## 関数詳細

### search_places()

**目的**: 指定された場所周辺の施設を検索

**使用API**: Google Maps Places API (New)

**主な処理**:

1. テキストクエリで場所を検索
2. 評価4.0以上のスポットをフィルタリング
3. 最大3件の結果を返す
4. 名前、住所、評価、座標、価格帯を含む

### calculate_route()

**目的**: ルート計算と交通情報の取得

**使用API**: Google Maps Routes API

**主な処理**:

1. 出発地、目的地、経由地を設定
2. 交通情報を考慮したルートを計算
3. 通行料金を算出
4. 所要時間、距離、ポリラインを返す

## エラーハンドリング

両関数とも、APIエラー時には`{"error": "エラーメッセージ"}`を返します。
エラーハンドリングは呼び出し側（main.py）で行います。
