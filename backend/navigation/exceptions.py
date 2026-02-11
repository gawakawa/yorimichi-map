"""navigation アプリケーション用のカスタム例外。"""


class GeminiFunctionCallingError(RuntimeError):
    """Gemini の Function Calling 処理中に発生したエラー。"""
