
# コントリビューションガイド

## 開発環境のセットアップ

1. Nix をインストール
2. ルートディレクトリで `direnv allow` を実行（pre-commit hooks 用）
3. 各サブディレクトリ（frontend/, backend/, terraform/）で `direnv allow` を実行

## Issue

- バグ報告や機能要望は Issue で受け付けています

## プルリクエスト

1. ブランチを作成
2. 変更を加える
3. `/commit` でコミット作成（[skill 定義](.claude/skills/commit/SKILL.md)）
4. `/pr` でプルリクエスト作成（[skill 定義](.claude/skills/pr/SKILL.md)）
5. CI がすべて通ったことを確認してマージ
