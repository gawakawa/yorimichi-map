"""Google Maps ディープリンク URL 生成モジュール。

このモジュールは、ルート計算結果をもとに Google Maps アプリ（またはブラウザ）で
ナビゲーションを起動するための URL を生成する。

生成される URL の形式:
  https://www.google.com/maps/dir/?api=1&origin=東京駅&destination=箱根湯本駅&waypoints=...&travelmode=driving

この URL をスマートフォンでタップすると Google Maps アプリが起動し、
指定されたルートでナビゲーションを開始できる。
"""

from __future__ import annotations

from urllib.parse import quote, urlencode


def generate_google_maps_url(
    origin: str,
    destination: str,
    waypoints: list[str] | None = None,
) -> str:
    """Google Maps ディープリンク URL を生成する。

    Google Maps Directions API の URL スキームを使用して、
    出発地→経由地→目的地のドライブルートを Google Maps で開く URL を組み立てる。

    Args:
        origin: 出発地の地名（例: "東京駅"）
        destination: 目的地の地名（例: "箱根湯本駅"）
        waypoints: 経由地のリスト（省略可）。パイプ(|)区切りで連結される。

    Returns:
        Google Maps を開くための完全な URL 文字列。
    """
    base_url = "https://www.google.com/maps/dir/"

    # Google Maps URL パラメータ（api=1 は URL スキーマのバージョン指定）
    params: dict[str, str] = {
        "api": "1",
        "origin": origin,
        "destination": destination,
        "travelmode": "driving",
    }

    # 経由地がある場合、パイプ(|)区切りで waypoints パラメータに追加
    if waypoints:
        params["waypoints"] = "|".join(quote(wp, safe="") for wp in waypoints)

    return f"{base_url}?{urlencode(params, quote_via=quote)}"
