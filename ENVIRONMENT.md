# yorimichi-map

## 🛠 開発環境のセットアップ

本プロジェクトは **Nix** と **direnv** を使用して、OSを汚さず、チーム全員で完全に同一の開発環境を共有できるように設計されています。

### 0. 前提条件 (WSLユーザーのみ)

WSL (Ubuntu等) を使用している場合、バイナリの解凍ツールと systemd が有効である必要があります。

```bash
sudo apt update && sudo apt install -y xz-utils

```

※ `/etc/wsl.conf` で `systemd=true` に設定し、WSLの再起動を行っておいてください。

### 1. Nix のインストール

以下のコマンドを実行し、マルチユーザーモードでインストールします。

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon

```

インストール後、設定を反映させるためにターミナルを再起動してください。

### 2. direnv のインストールと設定

環境の自動切り替えを有効にするため、`direnv` を導入します。

```bash
# 1. direnv本体のインストール
nix-env -iA nixpkgs.direnv

# 2. シェルへのフック設定 (bashの場合)
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc

```

### 3. プロジェクト環境の有効化

リポジトリの各ディレクトリへ移動し、環境変数のロードを許可します。これにより、必要なSDKやツールが自動でインストールされます。

```bash
# ルート（Git Hooks等）
direnv allow .

# バックエンド (Python, AI libraries, gcloud)
cd backend && direnv allow . && cd ..

# フロントエンド (Node.js, Web framework)
cd frontend && direnv allow . && cd ..

# インフラ (Terraform)
cd terraform && direnv allow . && cd ..

```

---

## 🚀 開発の流れ

### ブランチ作成とコーディング

`CONTRIBUTING.md` のガイドに従い、作業ブランチを作成して開発を開始してください。

### コミットとプルリクエスト

本プロジェクトでは AI 支援スキルを活用して一貫した運用を行っています。

* **コミット**: `/commit` スキルを使用して、メッセージの自動生成と作成を行います。
* **PR作成**: `/pr` スキルを使用して、変更内容の要約とプルリクエストの作成を行います。

---

## 📂 ディレクトリ構成

* `backend/`: AI・APIサーバー (Google Cloud 連携)
* `frontend/`: Webフロントエンド
* `terraform/`: IaC (Google Cloud インフラ定義)