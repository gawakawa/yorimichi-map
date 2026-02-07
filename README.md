# 🗺️ 寄り道マップ (Yorimichi Map)

> 「移動」を「旅」に変える、会話型AIドライブパートナー

寄り道スポットを含めた経路探索アプリケーション。「海が見たい」「美味しい蕎麦が食べたい」といった曖昧な指示から、最適な寄り道スポットを含めたルートを提案します。

## ✨ 主な機能

- 🗣️ **自然言語でプランニング**: カジュアルな言葉でAIに伝えるだけ
- 🗺️ **スマートルーティング**: 渋滞、料金、景色、あなたの好みを考慮
- 📍 **インテリジェントな経由地提案**: ルート沿いの高評価スポットを自動検索
- 🔄 **ワンタップで帰路作成**: 経由地を逆順にした帰りのルートを自動生成
- 📱 **Googleマップ連携**: ディープリンクで直接Googleマップアプリを起動

## 🏗️ プロジェクト構成

### ディレクトリ構造

```text
yorimichi-map/
├── frontend/              # React 19 + Vite フロントエンド
│   ├── src/
│   ├── package.json
│   ├── flake.nix         # Node.js 24, pnpm
│   └── .envrc
├── backend/               # Django 6 REST API
│   ├── src/
│   ├── pyproject.toml
│   ├── flake.nix         # Python 3.13, uv
│   └── .envrc
├── terraform/             # Infrastructure as Code
│   ├── main.tf
│   ├── flake.nix         # OpenTofu
│   └── .envrc
├── docs/                  # プロジェクトドキュメント
│   ├── overview/         # 概要・アーキテクチャ
│   ├── setup/            # セットアップガイド
│   ├── development/      # 開発ガイド
│   ├── features/         # 機能詳細
│   └── troubleshooting.md
├── .claude/               # Claude Code設定
│   ├── rules/            # ディレクトリ別ルール
│   ├── skills/           # カスタムスキル
│   └── settings.json
├── .github/
│   └── workflows/        # CI/CD設定
├── CONTRIBUTING.md        # コントリビューションガイド
├── CLAUDE.md             # Claude Code向けガイダンス
├── flake.nix             # ルートNixフレーク（pre-commit hooks）
└── README.md             # このファイル
```

### 技術スタック

- **フロントエンド**: React 19, Vite, TypeScript, Node.js 24, pnpm
- **バックエンド**: Django 6, Python 3.13, uv, PostgreSQL
- **インフラ**: OpenTofu (Terraform), Google Cloud Platform
- **開発環境**: Nix Flakes, direnv
- **CI/CD**: GitHub Actions

## 🚀 開発環境のセットアップ

### 前提条件

- **Nix** (flakes有効化)
- **direnv**

### クイックスタート

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd yorimichi-map

# 2. ルートディレクトリで環境を有効化
direnv allow

# 3. 各サブディレクトリで環境を有効化
cd frontend && direnv allow && cd ..
cd backend && direnv allow && cd ..
cd terraform && direnv allow && cd ..
```

詳細なセットアップ手順は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## 📚 ドキュメント

プロジェクトの詳細なドキュメントは [docs/](./docs/) ディレクトリにあります。

### 概要 (docs/overview/)

- **[concept.md](docs/overview/concept.md)** - プロジェクト概要、解決する課題、独自の価値提案
- **[architecture.md](docs/overview/architecture.md)** - システムアーキテクチャとコンポーネント構成
- **[tech-stack.md](docs/overview/tech-stack.md)** - 技術スタック、依存ライブラリ

### セットアップ (docs/setup/)

- **[prerequisites.md](docs/setup/prerequisites.md)** - 前提条件、必要なAPI
- **[installation.md](docs/setup/installation.md)** - インストール手順
- **[configuration.md](docs/setup/configuration.md)** - 環境変数設定

### 開発 (docs/development/)

- **[workflows.md](docs/development/workflows.md)** - 開発フェーズ、デモシナリオ
- **[implementation/tools.md](docs/development/implementation/tools.md)** - API連携ロジック
- **[implementation/utils.md](docs/development/implementation/utils.md)** - UI・マップ連携
- **[implementation/main.md](docs/development/implementation/main.md)** - メインアプリケーション

### 機能 (docs/features/)

- **[usage-examples.md](docs/features/usage-examples.md)** - 使用例、デモシナリオ
- **[ui-components.md](docs/features/ui-components.md)** - UI機能、レイアウト
- **[function-calling.md](docs/features/function-calling.md)** - Function Callingのフロー
- **[deep-linking.md](docs/features/deep-linking.md)** - ディープリンク実装

### トラブルシューティング

- **[troubleshooting.md](docs/troubleshooting.md)** - よくある問題と解決方法

## 🤝 コントリビューション

プルリクエストを歓迎します。

1. ブランチを作成
2. 変更を加える
3. `/commit` でコミット作成（gitmojiプレフィックス + 日本語メッセージ）
4. `/pr` でプルリクエスト作成
5. CI がすべて通ったことを確認してマージ

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## 📝 コミット規約

- **gitmojiプレフィックス必須**: `:sparkles:`, `:bug:`, `:wrench:` など
- **日本語メッセージ**: コミットメッセージは日本語で記述
- **明示的なファイル指定**: `git add -A` や `git add .` は使用禁止

## 🔧 開発ツール

### Claude Code スキル

- **`/commit`**: gitmojiプレフィックス付きコミット作成 ([定義](.claude/skills/commit/SKILL.md))
- **`/pr`**: プルリクエスト作成 ([定義](.claude/skills/pr/SKILL.md))

### Pre-commit Hooks

自動的に実行されるフック：

- treefmt (フォーマット)
- statix, deadnix (Nixリント)
- actionlint (GitHub Actionsバリデーション)
- ruff, ty (Python)
- oxlint (TypeScript)

## 📄 ライセンス

[ライセンス情報]

## 📧 お問い合わせ

[連絡先情報]
