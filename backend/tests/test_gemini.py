"""gemini サービスのユニットテスト（モック使用）。"""

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

from navigation.services.gemini import _build_history  # noqa: E402

# _build_history はローカルロジックのみなのでモック不要


class TestBuildHistory:
    """_build_history のユニットテスト。"""

    def test_empty_history(self) -> None:
        """空のリストから空の Content リストを返すこと。"""
        result = _build_history([])
        assert result == []

    def test_user_and_assistant_roles(self) -> None:
        """user/assistant のロールが正しく変換されること。"""
        history = [
            {"role": "user", "content": "こんにちは"},
            {"role": "assistant", "content": "はい、何でしょう？"},
        ]
        result = _build_history(history)

        assert len(result) == 2
        assert result[0].role == "user"
        assert result[1].role == "model"

    def test_unknown_role_becomes_model(self) -> None:
        """未知のロールは model として扱われること。"""
        history = [{"role": "system", "content": "テスト"}]
        result = _build_history(history)

        assert result[0].role == "model"

    def test_missing_content_defaults_empty(self) -> None:
        """content が欠落している場合、空文字列が使われること。"""
        history = [{"role": "user"}]
        result = _build_history(history)

        assert len(result) == 1
        assert result[0].parts[0].text == ""
