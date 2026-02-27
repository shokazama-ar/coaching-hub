-- coaching-hub Supabase schema (Step 1 MVP)
-- 想定: auth.users によるメール招待制ログイン

-- 拡張
create extension if not exists "uuid-ossp";

-- =========================================================
-- チーム & ユーザ
-- =========================================================

create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid not null, -- auth.users.id
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null, -- 例: メインコーチ / サブコーチ
  is_admin boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, name)
);

create table if not exists public.profiles (
  id uuid primary key, -- auth.users.id と一致
  team_id uuid not null references public.teams(id) on delete cascade,
  display_name text,
  role_id uuid references public.roles(id) on delete set null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_team_user_unique unique (team_id, id)
);

-- =========================================================
-- 選手 (ニックネームのみ、カテゴリ所属を保持)
-- =========================================================

create table if not exists public.athletes (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  nickname text not null, -- 実名ではなくニックネーム
  grade_band text,        -- 例: 低学年 / 高学年 など
  group_label text,       -- 例: Aチーム / Bチーム など任意のカテゴリ
  number integer,         -- ゼッケン番号など
  memo text,
  is_active boolean not null default true,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, nickname, number)
);

-- =========================================================
-- 練習構造: Phase / Category / Subject
-- =========================================================

-- 練習テーマ (例: 1on1強化)
create table if not exists public.phases (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5つの大カテゴリ + サブカテゴリ
-- kind: up / workout / offense / defense / down
create type if not exists public.practice_category_kind as enum (
  'up',
  'workout',
  'offense',
  'defense',
  'down'
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  kind public.practice_category_kind not null,
  name text not null,          -- 表示名 (例: アップ / 1on1 / 2on2 など)
  is_primary boolean not null default false, -- 5つの固定大カテゴリかどうか
  parent_category_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, kind, name)
);

-- 練習メニュー (Subject)
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  phase_id uuid references public.phases(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text,
  difficulty smallint,      -- 1〜5など
  tags text[],              -- タグ用途
  is_active boolean not null default true,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Practice Log 本体
-- =========================================================

create table if not exists public.practice_logs (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  practice_date date not null,
  phase_id uuid references public.phases(id) on delete set null,
  title text,                -- 任意のタイトル
  daily_reflection text,     -- Daily Reflection
  created_by uuid not null,  -- profiles.id / auth.users.id
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ログに紐づく Subject の構成 (順番・時間など)
create table if not exists public.practice_log_subjects (
  id uuid primary key default uuid_generate_v4(),
  practice_log_id uuid not null references public.practice_logs(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  block_order integer not null default 0,
  duration_minutes integer,   -- 実施時間
  memo text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (practice_log_id, subject_id, block_order)
);

-- メディア (写真・動画) - Supabase Storage 上のパスを保持
create table if not exists public.log_media (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  practice_log_id uuid not null references public.practice_logs(id) on delete cascade,
  uploaded_by uuid not null,  -- profiles.id
  storage_bucket text not null default 'practice-media',
  storage_path text not null, -- 例: team_id/log_id/xxxx.jpg
  mime_type text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 個別選手メモ
create table if not exists public.individual_notes (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  practice_log_id uuid not null references public.practice_logs(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  author_id uuid not null, -- profiles.id
  content text not null,
  positive_points text,    -- 良かった点など (任意で分離)
  focus_points text,       -- 今後のフォーカス
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- リアクション (既読 / ナイス 等)
create type if not exists public.reaction_type as enum (
  'read',
  'nice',
  'idea',
  'question'
);

create table if not exists public.reactions (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  practice_log_id uuid not null references public.practice_logs(id) on delete cascade,
  user_id uuid not null, -- profiles.id
  type public.reaction_type not null,
  inserted_at timestamptz not null default now(),
  unique (practice_log_id, user_id, type)
);

-- =========================================================
-- RLS 用: 自チーム判定ヘルパー
-- =========================================================

create or replace function public.current_team_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

-- =========================================================
-- Row Level Security (RLS)
-- 同じ team_id を持つユーザーのみ閲覧・編集可能
-- =========================================================

-- まず RLS を有効化
alter table public.teams enable row level security;
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.athletes enable row level security;
alter table public.phases enable row level security;
alter table public.categories enable row level security;
alter table public.subjects enable row level security;
alter table public.practice_logs enable row level security;
alter table public.practice_log_subjects enable row level security;
alter table public.log_media enable row level security;
alter table public.individual_notes enable row level security;
alter table public.reactions enable row level security;

-- teams: チームメンバーのみ
create policy if not exists teams_select_same_team
on public.teams
for select
using (id = public.current_team_id());

create policy if not exists teams_update_same_team_admin
on public.teams
for update
using (
  id = public.current_team_id()
  and exists (
    select 1 from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and p.team_id = teams.id
      and coalesce(r.is_admin, false) = true
  )
);

-- profiles: 同一チームのみ閲覧・編集
create policy if not exists profiles_select_same_team
on public.profiles
for select
using (team_id = public.current_team_id());

create policy if not exists profiles_update_self_or_admin
on public.profiles
for update
using (
  id = auth.uid()
  or exists (
    select 1 from public.roles r
    where r.id = profiles.role_id
      and coalesce(r.is_admin, false) = true
  )
);

-- roles: 同一チームのみ
create policy if not exists roles_all_same_team
on public.roles
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

-- 共通: team_id = current_team_id() のみ許可
create policy if not exists athletes_all_same_team
on public.athletes
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists phases_all_same_team
on public.phases
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists categories_all_same_team
on public.categories
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists subjects_all_same_team
on public.subjects
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists practice_logs_all_same_team
on public.practice_logs
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists practice_log_subjects_all_same_team
on public.practice_log_subjects
for all
using (
  exists (
    select 1 from public.practice_logs pl
    where pl.id = practice_log_subjects.practice_log_id
      and pl.team_id = public.current_team_id()
  )
)
with check (
  exists (
    select 1 from public.practice_logs pl
    where pl.id = practice_log_subjects.practice_log_id
      and pl.team_id = public.current_team_id()
  )
);

create policy if not exists log_media_all_same_team
on public.log_media
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists individual_notes_all_same_team
on public.individual_notes
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

create policy if not exists reactions_all_same_team
on public.reactions
for all
using (team_id = public.current_team_id())
with check (team_id = public.current_team_id());

