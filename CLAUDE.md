# CLAUDE.md — AI エージェント向けルール

セットアップ手順・環境構成・コマンド一覧は [README.md](./README.md) を参照。
ここには README に書かれていない AI 固有のルールと既知の地雷のみ記載する。

## コマンドの注意

- `next` コマンドは PATH に存在しない。必ず `node_modules/.bin/next` を使うこと。

## ワークフロールール

- **Git push 前に必ずユーザーに確認する**: 「ステージングへ直接反映」か「ローカルで先に検証」かを聞く
- DB マイグレーション・認証・RLS 変更 → ローカル検証を推奨
- フロントのみの変更 → ステージング直行でも可

### タスク管理・実装フロー（チームモード）

1. **タスク積み上げフェーズ（このエージェント）**: 実装指示ファイルを `blueprint/tasks/todo/` に作成するのみ。コードは書かない。
2. **実装フェーズ（プログラマーエージェント）**: ユーザーが「実装開始」を指示したタイミングで、`Agent` ツールを使って別のプログラマーエージェントを呼び出し、`todo/` のタスクファイルを渡して実装させる。
3. **完了後**: 実装済みタスクファイルを `done/` へ移動し、ADR・defines を更新してからコミット。

> このエージェント自身がコードを書いてはならない。実装はすべてプログラマーエージェントに委譲すること。

### blueprint ディレクトリ構成

```
blueprint/
├── adr/          # Architecture Decision Records
│   └── YYYYMMDD-<slug>.md   # 新規ADRはこの形式で作成
├── defines/      # スキーマ・UIルール等の定義ファイル
│   ├── schema.md            # DBテーブル定義
│   └── ui-rules.md          # UIスタイル規則
└── tasks/        # タスク管理（.gitignore 対象・ローカル専用）
    ├── todo/     # 未着手（近く着手予定の実装キュー）
    ├── pending/  # バックログ（しばらく着手しない・劣後理由を明記）
    └── done/     # 完了済み
```

#### blueprint 各ディレクトリの使い方

**`tasks/todo/`** — タスクファイルを作成するルール:
- ファイル名: `task-YYYYMMDDNNN-<slug>.md`（連番）
- 必須項目: ステータス・優先度・競合リスク・依存タスク・変更ファイル一覧・実装手順
- `blueprint/tasks/` は `.gitignore` 対象のため、ローカル専用

**`adr/`** — ADR 作成ルール:
- ファイル名: `YYYYMMDD-<slug>.md`
- 必須項目: ステータス・背景・決定事項・影響ファイル
- **リモートへの push 前に必ず ADR を作成・更新してからコミットすること**

**`defines/`** — スキーマ・UIルールに変更があれば対応するファイルを合わせて更新すること

## 既知の地雷

### `router.push()` + `router.refresh()` の競合

`router.push()` の直後に `router.refresh()` を呼ぶと遷移が中断される。
遷移後のリフレッシュが必要に見えても `router.push()` のみにすること。

### Supabase Auth — メール確認

クラウド環境はデフォルトでメール確認必須 (`mailer_autoconfirm: false`)。
ログインエラー `Email not confirmed` は「パスワード誤り」ではなく専用メッセージで案内する。

### RLS — 自己参照による無限ループ

チームメンバー系テーブルの SELECT ポリシーで同テーブルを参照すると `infinite recursion detected` になる。
回避策: `SECURITY DEFINER` 関数を経由してポリシーを定義する。

### マイグレーションファイルは同コミットに含める

マイグレーションファイルは、それを必要とするコード変更と **必ず同じコミットに含める**こと。

- コードと一緒に `supabase/migrations/` 内のファイルを `git add` してコミットする
- ローカルで手動適用したマイグレーションも、必ず次のコミットで git に追加する
- push 前に `supabase/migrations/` に未コミットファイルが残っていないか確認する
- Supabase ダッシュボードで SQL を直接実行した場合は migration ファイルを作成し、`npx supabase migration repair --status applied <バージョン番号>` でリモート履歴に記録する
- 履歴の確認: `npx supabase migration list`（Local/Remote の一致を確認）
