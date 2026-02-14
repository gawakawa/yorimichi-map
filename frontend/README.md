# フロントエンド

寄り道マップのフロントエンド。

## 開発

### セットアップ

開発環境の構築は以下のコマンドで行う。

- `direnv allow` - 開発環境の有効化
- `pnpm install` - 依存関係のインストール

### 環境変数

Google Maps API キーを設定する必要がある。

1. `.env.local.example` をコピーして `.env.local` を作成
2. [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) で API キーを取得
3. `.env.local` に API キーを設定

```bash
cp .env.local.example .env.local
# .env.local を編集して VITE_GOOGLE_MAPS_API_KEY を設定
```

### コマンド

開発にあたっては以下のようなコマンドが利用可能。

- `pnpm dev` - 開発サーバー起動 (localhost:5173)
- `pnpm test` - テスト実行
- `pnpm lint` - リンター・型チェック
- `nix fmt` - フォーマット
- `nix build` - 本番ビルド
- `nix run .#container.copyToPodman && podman run --rm -p 8080:8080 yorimichi-map-frontend` - コンテナで起動

詳細は [`flake.nix`](./flake.nix) および [`package.json`](./package.json) を参照。

### CI

CI では以下のチェックが実行される。

- `nix flake check` - フォーマット・リンター・型チェック
- `pnpm test` - テスト実行
- `nix build .#container` - コンテナビルド

## API連携

バックエンドAPI仕様書: <http://localhost:8000/api/docs/>

開発時はバックエンドを `localhost:8000` で起動しておく必要がある。

## 構成

```text
.
├── src/       # ソースコード
├── tests/     # テスト
└── public/    # 静的ファイル
```

## 技術スタック

- React 19 - UI ライブラリ
- Vite - ビルドツール
- TanStack Query - データフェッチング
- @vis.gl/react-google-maps - Google Maps 統合
- TypeScript - 型安全性
