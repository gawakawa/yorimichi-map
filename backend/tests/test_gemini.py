"""gemini サービスのユニットテスト（モック使用）。"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import django
from dotenv import load_dotenv
from google.api_core.exceptions import ResourceExhausted

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
sys.path.insert(0, str(backend_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yorimichi_map_backend.settings")
django.setup()

from navigation.services.gemini import _build_history, send_message  # noqa: E402

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


class TestSendMessageRetry:
    """send_message のリトライロジックのテスト。"""

    @patch("navigation.services.gemini.GenerativeModel")
    @patch("navigation.services.gemini._ensure_initialized")
    @patch("navigation.services.gemini.time.sleep")
    def test_retry_on_resource_exhausted(
        self,
        mock_sleep: MagicMock,
        mock_init: MagicMock,
        mock_model_class: MagicMock,
    ) -> None:
        """ResourceExhausted 発生時にリトライして成功すること。"""
        mock_chat = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "成功しました"

        # 1回目: ResourceExhausted, 2回目: 成功
        mock_chat.send_message.side_effect = [
            ResourceExhausted("Rate limited"),
            mock_response,
        ]
        mock_chat.history = []

        mock_model = MagicMock()
        mock_model.start_chat.return_value = mock_chat
        mock_model_class.return_value = mock_model

        reply, route, places = send_message("テスト")

        assert reply == "成功しました"
        assert mock_chat.send_message.call_count == 2
        mock_sleep.assert_called_once_with(1)  # 2^0 = 1 second

    @patch("navigation.services.gemini.GenerativeModel")
    @patch("navigation.services.gemini._ensure_initialized")
    @patch("navigation.services.gemini.time.sleep")
    def test_retry_exhausted_returns_error(
        self,
        mock_sleep: MagicMock,
        mock_init: MagicMock,
        mock_model_class: MagicMock,
    ) -> None:
        """3回リトライしても失敗した場合、エラーメッセージを返すこと。"""
        mock_chat = MagicMock()
        mock_chat.send_message.side_effect = ResourceExhausted("Rate limited")
        mock_chat.history = []

        mock_model = MagicMock()
        mock_model.start_chat.return_value = mock_chat
        mock_model_class.return_value = mock_model

        reply, route, places = send_message("テスト")

        assert "サーバーが混み合っています" in reply
        assert route is None
        assert places is None
        assert mock_chat.send_message.call_count == 3
        # sleep calls: 1s, 2s (not called after 3rd failure)
        assert mock_sleep.call_count == 2

    @patch("navigation.services.gemini.GenerativeModel")
    @patch("navigation.services.gemini._ensure_initialized")
    @patch("navigation.services.gemini.time.sleep")
    def test_exponential_backoff_timing(
        self,
        mock_sleep: MagicMock,
        mock_init: MagicMock,
        mock_model_class: MagicMock,
    ) -> None:
        """指数バックオフが 1, 2, 4 秒で動作すること。"""
        mock_chat = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "成功"

        # 2回失敗、3回目で成功
        mock_chat.send_message.side_effect = [
            ResourceExhausted("Rate limited"),
            ResourceExhausted("Rate limited"),
            mock_response,
        ]
        mock_chat.history = []

        mock_model = MagicMock()
        mock_model.start_chat.return_value = mock_chat
        mock_model_class.return_value = mock_model

        reply, route, places = send_message("テスト")

        assert reply == "成功"
        assert mock_sleep.call_count == 2
        mock_sleep.assert_any_call(1)  # 2^0
        mock_sleep.assert_any_call(2)  # 2^1
