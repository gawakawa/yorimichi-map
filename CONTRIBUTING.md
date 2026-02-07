# コントリビューションガイド

## 開発環境のセットアップ

本プロジェクトは **Nix** と **direnv** を使用して、OSを汚さず、チーム全員で完全に同一の開発環境を共有できるように設計されています。

### 前提条件

#### WSLユーザー（Windows）の場合

WSL (Ubuntu等) を使用している場合、以下の準備が必要です。

```bash
# バイナリの解凍ツールをインストール
sudo apt update && sudo apt install -y xz-utils
```

**systemdの有効化**:

`/etc/wsl.conf` に以下を追記し、WSLを再起動してください。

```ini
[boot]
systemd=true
```

WSLの再起動方法（PowerShellで実行）。

```powershell
wsl --shutdown
```

### 1. Nixのインストール

以下のコマンドを実行し、Nixをインストールします。

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

**WSL環境での注意**:

- マルチユーザーモード（`--daemon`）を推奨しますが、権限問題が発生する場合はシングルユーザーモード（`--no-daemon`）も検討できます
- インストール後、設定を反映させるためにターミナルを再起動してください

**インストール確認**:

```bash
nix --version
```

### 2. direnvのインストールと設定

環境の自動切り替えを有効にするため、`direnv` を導入します。

#### インストール

**推奨方法**（Nix Profile）:

```bash
nix profile install nixpkgs#direnv
```

**代替方法**（従来の方法）:

```bash
nix-env -iA nixpkgs.direnv
```

#### シェルへのフック設定

お使いのシェルに応じて、以下のコマンドを実行してください。

**Bash**:

```bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

**Zsh**:

```bash
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

**Fish**:

```bash
echo 'direnv hook fish | source' >> ~/.config/fish/config.fish
source ~/.config/fish/config.fish
```

### 3. プロジェクト環境の有効化

リポジトリの各ディレクトリへ移動し、環境変数のロードを許可します。
これにより、必要なSDKやツールが自動でインストールされます。

```bash
# ルートディレクトリ（Git Hooks等）
direnv allow

# 各サブディレクトリ
cd frontend && direnv allow && cd ..
cd backend && direnv allow && cd ..
cd terraform && direnv allow && cd ..
```

**重要**: 各ディレクトリに入ると、direnvが自動的に開発環境をロードします。`.envrc`ファイルを変更した場合は、再度`direnv allow`を実行してください。

### 4. コマンドの実行方法

プロジェクト内でコマンドを実行する際は、`direnv exec` を使用することを推奨します。

```bash
# 例: フロントエンドのビルド
cd frontend
direnv exec . pnpm build

# 例: バックエンドのテスト
cd backend
direnv exec . uv run pytest
```

`direnv exec` を使用することで、現在のディレクトリの開発環境が確実にロードされます。

## 開発の流れ

### ブランチ作成とコーディング

1. **Issueの確認**: 作業する内容に関連するIssueを確認（なければ作成）
2. **ブランチ作成**: 機能追加やバグ修正用のブランチを作成
3. **開発**: 変更を加える
4. **Pre-commit hooks**: 自動的にフォーマットとリントが実行されます

### コミットとプルリクエスト

本プロジェクトでは、AI支援スキルを活用して一貫した運用を行っています。

- **コミット**: `/commit` スキルを使用して、gitmojiプレフィックス付きの日本語コミットメッセージを自動生成
  - 詳細: [.claude/skills/commit/SKILL.md](.claude/skills/commit/SKILL.md)
  - 例: `:sparkles: 新機能を追加`、`:bug: バグを修正`
- **プルリクエスト**: `/pr` スキルを使用して、変更内容の要約とPRを作成
  - 詳細: [.claude/skills/pr/SKILL.md](.claude/skills/pr/SKILL.md)
  - PRの説明は日本語で記述されます

### CI/CDの確認

プルリクエストを作成すると、以下のCIワークフローが自動実行されます。

- `nix-ci.yml` - ルートflakeのチェック
- `frontend-ci.yml` - フロントエンドのフォーマット、リント、テスト
- `backend-ci.yml` - バックエンドのフォーマット、リント、テスト
- `terraform-ci.yml` - Terraformのflakeチェック

**すべてのCIが通過したことを確認してからマージしてください。**

## Issue

バグ報告や機能要望は Issue で受け付けています。

### Issueの作成

- バグ報告: 再現手順、期待される動作、実際の動作を明記
- 機能要望: 具体的なユースケースと期待される結果を記述

## プルリクエスト

### PRの作成手順

1. **ブランチを作成**: `git checkout -b feature/your-feature-name`
2. **変更を加える**: コードを編集
3. **コミット作成**: `/commit` スキルを使用（gitmojiプレフィックス + 日本語メッセージ）
4. **プッシュ**: `git push -u origin feature/your-feature-name`
5. **PR作成**: `/pr` スキルを使用して日本語の説明付きPRを作成
6. **CI確認**: すべてのCIが通過することを確認
7. **レビュー**: レビューを受けて必要に応じて修正
8. **マージ**: レビュー承認後にマージ

### コミット規約

- **gitmojiプレフィックス必須**: `:sparkles:`, `:bug:`, `:wrench:` など
- **日本語メッセージ**: コミットメッセージは日本語で記述
- **明示的なファイル指定**: `git add -A` や `git add .` は使用禁止。常に明示的にファイルを指定

例:

```bash
git add src/components/NewComponent.tsx
# /commit スキルを使用してコミット作成
```

### Pre-commitフックについて

プロジェクトでは、以下のpre-commitフックが自動実行されます。

- **treefmt**: すべてのファイルタイプのフォーマット
- **statix, deadnix**: Nixファイルのリント
- **actionlint**: GitHub Actionsのバリデーション
- **ruff, ty**: Pythonコード（backendのみ）
- **oxlint**: TypeScriptコード（frontendのみ）

フックが失敗した場合は、エラーメッセージに従って修正してください。

## ディレクトリ構成

```text
yorimichi-map/
├── backend/        # AI・APIサーバー（Django 6, Python 3.13）
├── frontend/       # Webフロントエンド（React 19, Node.js 24）
├── terraform/      # IaC（OpenTofu）
├── .claude/        # Claude Code設定とスキル定義
├── docs/           # プロジェクトドキュメント
└── README.md       # プロジェクト概要
```

各サブディレクトリには、独自のNix flakeとdirenv設定があります。

## 参考資料

- **プロジェクト概要**: [README.md](README.md)
- **Claude Code設定**: [CLAUDE.md](CLAUDE.md)
- **ドキュメント**: [docs/](docs/)
- **フロントエンドルール**: [.claude/rules/frontend/](.claude/rules/frontend/)
- **バックエンドルール**: [.claude/rules/backend/](.claude/rules/backend/)
- **Terraformルール**: [.claude/rules/terraform/](.claude/rules/terraform/)
