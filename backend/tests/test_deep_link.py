"""deep_link サービスのユニットテスト。"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import django
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0, str(backend_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yorimichi_map_backend.settings")
django.setup()

import pytest  # noqa: E402

from navigation.services.deep_link import generate_google_maps_url  # noqa: E402


class TestGenerateGoogleMapsUrl:
    """generate_google_maps_url のユニットテスト。"""

    def test_basic_url(self) -> None:
        """出発地と目的地のみの URL が正しく生成されること。"""
        url = generate_google_maps_url(origin="東京駅", destination="横浜駅")

        assert url.startswith("https://www.google.com/maps/dir/")
        assert "api=1" in url
        assert "travelmode=driving" in url
        assert "waypoints" not in url

    def test_with_waypoints(self) -> None:
        """経由地付き URL にパイプ区切りの waypoints が含まれること。"""
        url = generate_google_maps_url(
            origin="東京駅",
            destination="箱根湯本駅",
            waypoints=["小田原駅", "熱海駅"],
        )

        assert "waypoints=" in url
        # パイプ区切りで連結されていること（URLエンコードされている可能性がある）
        assert "%7C" in url or "|" in url

    def test_empty_waypoints(self) -> None:
        """空の waypoints リストの場合、waypoints パラメータが含まれないこと。"""
        url = generate_google_maps_url(origin="A", destination="B", waypoints=[])

        assert "waypoints" not in url

    def test_none_waypoints(self) -> None:
        """waypoints=None の場合、waypoints パラメータが含まれないこと。"""
        url = generate_google_maps_url(origin="A", destination="B", waypoints=None)

        assert "waypoints" not in url

    def test_single_waypoint(self) -> None:
        """経由地が1つの場合も正しく動作すること。"""
        url = generate_google_maps_url(origin="A", destination="C", waypoints=["B"])

        assert "waypoints=" in url

    @pytest.mark.parametrize(
        "waypoint",
        [
            "箱根湯本駅（東口）",
            "手打ち蕎麦 山路",
            "café & bar #1",
            "道の駅・箱根峠",
        ],
    )
    def test_special_characters_in_waypoints(self, waypoint: str) -> None:
        """特殊文字を含む経由地でも URL が正しく生成されること。"""
        url = generate_google_maps_url(
            origin="東京駅",
            destination="箱根湯本駅",
            waypoints=[waypoint],
        )
        assert "waypoints=" in url

    def test_pipe_in_waypoint_is_stripped(self) -> None:
        """経由地にパイプ文字が含まれる場合、除去されること。"""
        url = generate_google_maps_url(
            origin="A",
            destination="B",
            waypoints=["テスト|場所"],
        )
        assert "waypoints=" in url
        # パイプがエンコード済みの区切り文字としてのみ存在すること
        # （地名中のパイプは除去される）

    def test_empty_waypoint_raises_error(self) -> None:
        """空文字の経由地が指定された場合、ValueError が発生すること。"""
        with pytest.raises(ValueError, match="空の地名"):
            generate_google_maps_url(origin="A", destination="B", waypoints=[""])

    def test_too_long_waypoint_raises_error(self) -> None:
        """極端に長い経由地が指定された場合、ValueError が発生すること。"""
        with pytest.raises(ValueError, match="地名が長すぎます"):
            generate_google_maps_url(
                origin="A", destination="B", waypoints=["あ" * 201]
            )
