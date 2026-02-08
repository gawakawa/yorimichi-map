# 💻 utils.py - UI・マップ連携・ディープリンク

## 概要

**役割**: 地図の描画とGoogleマップURL生成を担当するヘルパー関数。

## 実装コード

```python
import folium
import polyline
import urllib.parse
from streamlit_folium import st_folium


def generate_google_maps_url(origin, destination, waypoints=None):
    """
    Googleマップアプリを起動するためのディープリンクURLを生成

    Args:
        origin: 出発地
        destination: 目的地
        waypoints: 経由地のリスト（オプション）

    Returns:
        Googleマップアプリ起動用URL
    """
    base_url = "https://www.google.com/maps/dir/?api=1"

    params = {
        "origin": origin,
        "destination": destination,
        "travelmode": "driving"
    }
    if waypoints:
        params["waypoints"] = "|".join(waypoints)

    return base_url + "&" + urllib.parse.urlencode(params)


def render_map(route_data):
    """
    ルートデータから地図を描画

    Args:
        route_data: calculate_route関数からの返り値

    Returns:
        Foliumマップオブジェクト
    """
    if not route_data or "encoded_polyline" not in route_data:
        return None

    # ポリラインのデコード
    points = polyline.decode(route_data["encoded_polyline"])

    if not points:
        return None

    # 地図作成（中心はルートの中間地点）
    mid_point = points[len(points) // 2]
    m = folium.Map(location=mid_point, zoom_start=10)

    # 線の描画
    folium.PolyLine(points, color="blue", weight=5, opacity=0.7).add_to(m)

    # マーカー
    folium.Marker(
        points[0],
        popup="Start",
        icon=folium.Icon(color='green', icon='play')
    ).add_to(m)

    folium.Marker(
        points[-1],
        popup="Goal",
        icon=folium.Icon(color='red', icon='flag')
    ).add_to(m)

    return m
```

## 関数詳細

### generate_google_maps_url()

**目的**: Googleマップアプリを起動するディープリンクを生成

**パラメータ**:

- `origin`: 出発地の名称または座標
- `destination`: 目的地の名称または座標
- `waypoints`: 経由地のリスト（オプション）

**返り値**: Googleマップアプリ起動用URL

**使用例**:

```python
url = generate_google_maps_url(
    origin="東京駅",
    destination="箱根湯本駅",
    waypoints=["小田原駅"]
)
# → https://www.google.com/maps/dir/?api=1&origin=東京駅&destination=箱根湯本駅&travelmode=driving&waypoints=小田原駅
```

### render_map()

**目的**: ルート情報から地図を描画

**パラメータ**:

- `route_data`: `calculate_route()`の返り値

**返り値**: Foliumマップオブジェクト

**主な処理**:

1. エンコードされたポリラインをデコード
2. ルートの中間地点を中心に地図を作成
3. ルートを青い線で描画
4. 出発地に緑のマーカー、目的地に赤のマーカーを配置

**使用例**:

```python
route_data = calculate_route("東京駅", "箱根湯本駅")
map_obj = render_map(route_data)
st_folium(map_obj, width="100%", height=400)
```

## ディープリンクについて

### ディープリンクとは

アプリケーション内の特定の画面や機能に直接リンクするURL。
Googleマップアプリを起動し、既に経路が設定された状態でユーザーに提供できます。

### URLスキーム

- **ベースURL**: `https://www.google.com/maps/dir/?api=1`
- **パラメータ**:
  - `origin`: 出発地
  - `destination`: 目的地
  - `travelmode`: 移動手段（driving, walking, bicycling, transit）
  - `waypoints`: 経由地（`|`で区切って複数指定可能）

### モバイル対応

このURLはデスクトップブラウザとモバイルブラウザの両方で動作し、
モバイルではGoogleマップアプリが自動的に起動します。
