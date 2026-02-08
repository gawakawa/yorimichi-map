from __future__ import annotations

from urllib.parse import quote, urlencode


def generate_google_maps_url(
    origin: str,
    destination: str,
    waypoints: list[str] | None = None,
) -> str:
    """Google Maps ディープリンクURLを生成する。"""
    base_url = "https://www.google.com/maps/dir/"

    params: dict[str, str] = {
        "api": "1",
        "origin": origin,
        "destination": destination,
        "travelmode": "driving",
    }

    if waypoints:
        params["waypoints"] = "|".join(quote(wp, safe="") for wp in waypoints)

    return f"{base_url}?{urlencode(params, quote_via=quote)}"
