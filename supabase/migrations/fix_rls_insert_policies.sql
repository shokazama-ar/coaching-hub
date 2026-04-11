-- RLS INSERT ポリシー修正
-- 問題: オンボーディング時に teams/profiles へのINSERTポリシーが存在せず、
--       roles/categories はプロフィール未作成で current_team_id() = NULL になり失敗する。

-- 1. teams: 認証済みユーザーが自分を created_by にしてチームを作成できる
create policy teams_insert_by_creator
on public.teams
for insert
with check (created_by = auth.uid());

-- 2. profiles: 自分自身のプロフィールを作成できる
create policy profiles_insert_self
on public.profiles
for insert
with check (id = auth.uid());

-- 3. roles: オンボーディング時（プロフィール未作成）にチーム作成者がロールを作成できる
--    (roles_all_same_team と OR で評価される)
create policy roles_insert_by_team_creator
on public.roles
for insert
with check (
  exists (
    select 1 from public.teams t
    where t.id = team_id
      and t.created_by = auth.uid()
  )
);

-- 4. categories: オンボーディング時にチーム作成者がカテゴリを作成できる
--    (categories_all_same_team と OR で評価される)
create policy categories_insert_by_team_creator
on public.categories
for insert
with check (
  exists (
    select 1 from public.teams t
    where t.id = team_id
      and t.created_by = auth.uid()
  )
);
