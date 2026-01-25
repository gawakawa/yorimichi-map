# バックエンド

寄り道マップのバックエンド。

## 開発

### セットアップ

開発環境の構築は以下のコマンドで行う。

- `direnv allow` - 開発環境の有効化
- `uv sync --all-groups` - 依存関係のインストール

### コマンド

開発にあたっては以下のようなコマンドが利用可能。

- `uv run python manage.py runserver` - 開発サーバー起動 (localhost:8000)
- `uv run pytest` - テスト実行
- `uv run ruff check` - リンター実行
- `uv run ty check` - 型チェック
- `nix fmt` - フォーマット
- `nix build` - 本番ビルド

詳細は [`flake.nix`](./flake.nix) および [`pyproject.toml`](./pyproject.toml) を参照。

### CI

CI では以下のチェックが実行される。

- `nix flake check` - フォーマット・リンター・型チェック
- `uv run pytest` - テスト実行
- `nix build .#container` - コンテナビルド

## API仕様書

開発サーバー起動後、以下のURLでAPI仕様書を確認できる。

- <http://localhost:8000/api/docs/> - Swagger UI
- <http://localhost:8000/api/schema/> - OpenAPI スキーマ

## 構成

Django のプロジェクトは以下の構成をとる。

```text
.
├── manage.py                # Django 管理コマンド
├── yorimichi_map_backend/   # 設定・エントリポイント
│   ├── settings.py          # 設定
│   ├── urls.py              # URL ルーティング
│   ├── wsgi.py              # WSGI エントリポイント
│   └── asgi.py              # ASGI エントリポイント
├── <app>/                   # アプリケーション
│   ├── models.py            # モデル
│   ├── views.py             # ビュー
│   ├── urls.py              # URL ルーティング
│   └── ...
└── tests/                   # テスト
```

詳細は [Django 公式ドキュメント](https://docs.djangoproject.com/en/6.0/intro/tutorial01/) を参照。

## 技術スタック

- Django 6 - Web フレームワーク
- Django REST Framework - REST API
- gunicorn - WSGI サーバー
