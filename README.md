# Coaching Hub

ミニバスケットボールのコーチ間で練習記録や選手メモをセキュアに共有するWebアプリケーション。
アナログな記録（手書きメモ等）をデジタル化し、コーチ間の「愛（指導）」と「最適化（効率）」を両立させる。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, shadcn/ui |
| Backend / Auth / Storage | Supabase |
| Deployment | Vercel |

---

## 開発ロードマップ

### Step 1: 練習記録の共有（MVP）※現在着手

- **コア**: 練習メニュー（フェーズ・カテゴリ・Subject）の構築と日々のログ
- **共有**: コーチ間の振り返り所感、写真・動画添付、既読スタンプ
- **プライバシー**: ニックネーム制、チーム内クローズド環境、厳格なRLS

### Step 2: 個人成長管理と試合スタッツ

- **OCR数値化**: Claude Vision等を利用し、手書きスコアシートからスタッツを自動抽出
- **スタッツ連携**: 抽出データを選手（ニックネーム）に紐づけ、得点・ファウル等の推移を可視化
- **成長ログ**: Step 1の「選手個別メモ」とスタッツを統合し、個人の成長を定点観測

### Step 3: 対外コミュニケーション・名刺管理

- **デジタル名刺**: チームプロフィールを作成し、他チームとの「コネクション」を管理
- **調整管理**: 練習試合の打診状況や、他チームの連絡先・特徴（スカウティングの基礎）を管理
- **公開制御**: 練習メニュー単位で、コネクションのある他チームへ「公開/非公開」を選択可能

### Step 4: チーム運営・外部連携

- **外部ツール連携**: 既存のチーム管理ツール等とのデータ連携
- **高度な分析**: シーズンを通したチーム全体のパフォーマンス分析

---

## Step 1 実装スコープ（MVP）

自チームのコーチ間で完結するクローズドな環境として実装する。

### A. ユーザー・チーム管理

- **Auth**: Supabase Authによる招待制ログイン
- **Roles**: 管理者が「メインコーチ」「サブコーチ」等の役割を動的に定義・付与
- **Privacy**: 選手は「ニックネーム」で登録し、実名は保持しない

### B. 練習管理の構造（Master-Detail）

| 概念 | 説明 |
|---|---|
| Phase | 練習テーマ（例：1on1強化）を最上位概念として管理 |
| Category | 5つの固定大カテゴリ（アップ/ワークアウト/オフェンス/ディフェンス/ダウン）とサブカテゴリ |
| Subject | 各カテゴリに紐づく具体的な練習メニュー。動的に追加可能 |
| Practice Log | 日々の練習記録。登録済みSubjectを組み合わせて作成 |

### C. 記録と共有

- **Daily Reflection**: 練習全体に対するテキスト所感
- **Media**: 写真・動画のアップロード機能（Supabase Storage）
- **Individual Note**: 練習ログ内で特定の選手を選択し、個別メモ
- **Reaction**: 投稿に対するスタンプ（既読・ナイス等）機能

---

## データベース設計の指針

**主要テーブル**:
`teams`, `profiles`, `roles`, `athletes`, `phases`, `categories`, `subjects`, `practice_logs`, `log_media`, `individual_notes`, `reactions`

- **RLS (Row Level Security)**: 同じ `team_id` を持つユーザーのみがデータを閲覧・編集できるポリシーを徹底
- **athletes テーブル**: チーム内の「低学年/高学年」などのカテゴリ所属を管理できる構造

**拡張性**: Step 2以降で「選手」にスタッツや外部IDが紐づくことを前提としたDB設計。

**セキュリティ**: Step 3で他チームとのデータ共有が発生するため、データの「所属（`team_id`）」と「共有範囲（`visibility`）」を明確に区別できる構造。

---

## UI/UX 指針

- **Mobile First**: 体育館での入力を想定したスマホ最適化UI
- **Input Optimization**: 練習メニューの選択はタップやドラッグを多用し、タイピングを最小化

---

## ディレクトリ構成

```
coaching-hub/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # ログイン画面
│   │   ├── (authenticated)/         # 認証後の画面
│   │   │   ├── athletes/            # 選手管理
│   │   │   ├── practice-logs/       # 練習ログ
│   │   │   └── settings/            # 設定（フェーズ・ロール・種目・チーム・プロフィール）
│   │   ├── actions/                 # Server Actions
│   │   ├── auth/callback/           # OAuth コールバック
│   │   └── onboarding/              # オンボーディング
│   ├── components/
│   │   ├── athletes/                # 選手関連コンポーネント
│   │   ├── layout/                  # レイアウト（ボトムナビ等）
│   │   ├── practice/                # 練習ログ関連コンポーネント
│   │   └── ui/                      # shadcn/ui コンポーネント
│   ├── lib/supabase/                # Supabase クライアント設定
│   └── types/                       # TypeScript 型定義
├── supabase/
│   ├── config.toml                  # Supabase ローカル設定
│   ├── migrations/                  # DB マイグレーションファイル
│   └── schema.sql                   # スキーマ定義
└── blueprint/                       # 設計ドキュメント（AI エージェント・開発者向け）
    ├── adr/                         # Architecture Decision Records（YYYYMMDD-slug.md）
    ├── defines/                     # スキーマ・UIルール等の定義ファイル
    │   ├── schema.md
    │   └── ui-rules.md
    └── tasks/                       # タスク管理（.gitignore 対象・ローカル専用）
        ├── todo/                    # 未着手
        ├── pending/                 # バックログ
        └── done/                   # 完了済み
```
