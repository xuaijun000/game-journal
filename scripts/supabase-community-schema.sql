-- PIXELFISH Community Schema — 社区功能迁移
-- 在 Supabase SQL Editor 中执行此文件
begin;

-- 确保 set_updated_at 函数存在（主 schema 已有时无影响）
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. 用户资料表 ──────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar text not null default '🎮',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


-- ── 2. 扩展 battle_teams 表 ────────────────────────────────
alter table public.battle_teams add column if not exists created_at timestamptz default now();
alter table public.battle_teams add column if not exists updated_at timestamptz default now();
alter table public.battle_teams add column if not exists is_public boolean not null default false;
alter table public.battle_teams add column if not exists likes_count integer not null default 0;
alter table public.battle_teams add column if not exists format text not null default 'singles';
alter table public.battle_teams add column if not exists author_username text;
alter table public.battle_teams add column if not exists author_avatar text;

create index if not exists battle_teams_public_idx on public.battle_teams (is_public);

-- 公开队伍允许所有人查看（覆盖原有只读自己的策略）
drop policy if exists "battle_teams_select_public" on public.battle_teams;
create policy "battle_teams_select_public" on public.battle_teams
  for select using (auth.uid() = user_id or is_public = true);


-- ── 3. 队伍点赞表 ─────────────────────────────────────────
create table if not exists public.team_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid not null references public.battle_teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, team_id)
);

create index if not exists team_likes_team_idx on public.team_likes (team_id);
create index if not exists team_likes_user_idx on public.team_likes (user_id);

alter table public.team_likes enable row level security;

drop policy if exists "team_likes_select_all" on public.team_likes;
create policy "team_likes_select_all" on public.team_likes
  for select using (true);

drop policy if exists "team_likes_insert_own" on public.team_likes;
create policy "team_likes_insert_own" on public.team_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "team_likes_delete_own" on public.team_likes;
create policy "team_likes_delete_own" on public.team_likes
  for delete using (auth.uid() = user_id);


-- ── 4. 队伍评论表 ─────────────────────────────────────────
create table if not exists public.team_comments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.battle_teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  content text not null check (char_length(content) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists team_comments_team_idx on public.team_comments (team_id, created_at asc);

alter table public.team_comments enable row level security;

drop policy if exists "team_comments_select_all" on public.team_comments;
create policy "team_comments_select_all" on public.team_comments
  for select using (true);

drop policy if exists "team_comments_insert_own" on public.team_comments;
create policy "team_comments_insert_own" on public.team_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "team_comments_delete_own" on public.team_comments;
create policy "team_comments_delete_own" on public.team_comments
  for delete using (auth.uid() = user_id);


-- ── 5. 扩展 pkm_catch_log — 捕捉/闪光分享 ───────────────────
alter table public.pkm_catch_log add column if not exists is_public boolean not null default false;
alter table public.pkm_catch_log add column if not exists author_username text;
alter table public.pkm_catch_log add column if not exists author_avatar text;
alter table public.pkm_catch_log add column if not exists likes_count integer not null default 0;

create index if not exists pkm_catch_log_public_idx on public.pkm_catch_log (is_public);

-- 覆盖原有只读自己的策略，允许公开记录所有人查看
drop policy if exists "pkm_catch_log_select_own" on public.pkm_catch_log;
drop policy if exists "pkm_catch_log_select_public" on public.pkm_catch_log;
create policy "pkm_catch_log_select_public" on public.pkm_catch_log
  for select using (auth.uid() = user_id or is_public = true);


-- ── 6. 扩展 pkm_series_log — 通关记录分享 ───────────────────
alter table public.pkm_series_log add column if not exists is_public boolean not null default false;
alter table public.pkm_series_log add column if not exists author_username text;
alter table public.pkm_series_log add column if not exists author_avatar text;
alter table public.pkm_series_log add column if not exists likes_count integer not null default 0;
alter table public.pkm_series_log add column if not exists series_name text;

create index if not exists pkm_series_log_public_idx on public.pkm_series_log (is_public);

drop policy if exists "pkm_series_log_select_own" on public.pkm_series_log;
drop policy if exists "pkm_series_log_select_public" on public.pkm_series_log;
create policy "pkm_series_log_select_public" on public.pkm_series_log
  for select using (auth.uid() = user_id or is_public = true);


-- ── 7. 扩展 pkm_partner — 排行榜公开 ────────────────────────
alter table public.pkm_partner add column if not exists is_public boolean not null default false;

create index if not exists pkm_partner_public_idx on public.pkm_partner (is_public);

-- 伙伴整行始终私有，排行榜仅通过下方白名单 RPC 公开。
drop policy if exists "Users manage own partner" on public.pkm_partner;
drop policy if exists "pkm_partner_public_select" on public.pkm_partner;
drop policy if exists "pkm_partner_manage_own" on public.pkm_partner;
create policy "pkm_partner_manage_own" on public.pkm_partner
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── 8. 对战记录表 ─────────────────────────────────────────
create table if not exists public.battle_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.battle_teams(id) on delete set null,
  result text not null check (result in ('win', 'lose', 'draw')),
  format text not null default 'singles',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists battle_records_user_idx on public.battle_records (user_id, created_at desc);

alter table public.battle_records enable row level security;

drop policy if exists "battle_records_select_own" on public.battle_records;
create policy "battle_records_select_own" on public.battle_records
  for select using (auth.uid() = user_id);

drop policy if exists "battle_records_insert_own" on public.battle_records;
create policy "battle_records_insert_own" on public.battle_records
  for insert with check (auth.uid() = user_id);

drop policy if exists "battle_records_delete_own" on public.battle_records;
create policy "battle_records_delete_own" on public.battle_records
  for delete using (auth.uid() = user_id);


-- ── 9. Champions 约战广场 ─────────────────────────────────
create table if not exists public.community_match_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  avatar text not null default '🎮',
  room_code text not null check (char_length(room_code) <= 24),
  format text not null default 'singles' check (format in ('singles', 'doubles')),
  rank_label text,
  note text check (char_length(note) <= 80),
  status text not null default 'open' check (status in ('open', 'closed')),
  expires_at timestamptz not null default (now() + interval '3 hours'),
  created_at timestamptz not null default now()
);

create index if not exists community_match_posts_open_idx
  on public.community_match_posts (status, expires_at desc, created_at desc);

alter table public.community_match_posts enable row level security;

drop policy if exists "community_match_posts_select_open" on public.community_match_posts;
create policy "community_match_posts_select_open" on public.community_match_posts
  for select using (status = 'open' and expires_at > now());

drop policy if exists "community_match_posts_insert_own" on public.community_match_posts;
create policy "community_match_posts_insert_own" on public.community_match_posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "community_match_posts_update_own" on public.community_match_posts;
create policy "community_match_posts_update_own" on public.community_match_posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "community_match_posts_delete_own" on public.community_match_posts;
create policy "community_match_posts_delete_own" on public.community_match_posts
  for delete using (auth.uid() = user_id);

-- ── 10. 上线加固：公开对象权限、原子点赞、最小公开排行榜 ──
-- 本文件可重复执行；已有环境先备份，再在测试项目执行并验证。
create table if not exists public.catch_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catch_id uuid not null references public.pkm_catch_log(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, catch_id)
);
create table if not exists public.series_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.pkm_series_log(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, series_id)
);
alter table public.catch_likes enable row level security;
alter table public.series_likes enable row level security;
create index if not exists catch_likes_target_idx on public.catch_likes(catch_id);
create index if not exists series_likes_target_idx on public.series_likes(series_id);

drop policy if exists "team_likes_select_all" on public.team_likes;
create policy "team_likes_select_all" on public.team_likes for select
  using (exists(select 1 from public.battle_teams t where t.id=team_id and (t.is_public or t.user_id=auth.uid())));
drop policy if exists "team_likes_insert_own" on public.team_likes;
create policy "team_likes_insert_own" on public.team_likes for insert
  with check (user_id=auth.uid() and exists(select 1 from public.battle_teams t where t.id=team_id and (t.is_public or t.user_id=auth.uid())));
drop policy if exists "team_comments_select_all" on public.team_comments;
create policy "team_comments_select_all" on public.team_comments for select
  using (exists(select 1 from public.battle_teams t where t.id=team_id and (t.is_public or t.user_id=auth.uid())));
drop policy if exists "team_comments_insert_own" on public.team_comments;
create policy "team_comments_insert_own" on public.team_comments for insert
  with check (user_id=auth.uid() and exists(select 1 from public.battle_teams t where t.id=team_id and (t.is_public or t.user_id=auth.uid())));

drop policy if exists "catch_likes_read_own" on public.catch_likes;
create policy "catch_likes_read_own" on public.catch_likes for select using(user_id=auth.uid());
drop policy if exists "series_likes_read_own" on public.series_likes;
create policy "series_likes_read_own" on public.series_likes for select using(user_id=auth.uid());
-- 点赞仅可通过 RPC 写入，避免并发覆盖以及客户端伪造计数。
revoke insert, update, delete on public.team_likes, public.catch_likes, public.series_likes from anon, authenticated;
grant select on public.team_likes, public.catch_likes, public.series_likes to authenticated;

create or replace function public.set_community_like(p_kind text,p_id uuid,p_liked boolean)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); target_owner uuid; visible boolean; total integer;
begin
  if actor is null then raise exception '请先登录' using errcode='42501'; end if;
  if p_liked is null then raise exception '缺少点赞状态'; end if;
  if p_kind='team' then
    select user_id,is_public into target_owner,visible from public.battle_teams where id=p_id for update;
  elsif p_kind='catch' then
    select user_id,is_public into target_owner,visible from public.pkm_catch_log where id=p_id for update;
  elsif p_kind='series' then
    select user_id,is_public into target_owner,visible from public.pkm_series_log where id=p_id for update;
  else raise exception '不支持的记录类型'; end if;
  if target_owner is null or not (visible or target_owner=actor) then
    raise exception '记录不存在或不可访问' using errcode='42501';
  end if;
  if p_kind='team' then
    if p_liked then insert into public.team_likes(user_id,team_id) values(actor,p_id) on conflict(user_id,team_id) do nothing;
    else delete from public.team_likes where user_id=actor and team_id=p_id; end if;
    select count(*)::integer into total from public.team_likes where team_id=p_id;
    update public.battle_teams set likes_count=total where id=p_id;
  elsif p_kind='catch' then
    if p_liked then insert into public.catch_likes(user_id,catch_id) values(actor,p_id) on conflict(user_id,catch_id) do nothing;
    else delete from public.catch_likes where user_id=actor and catch_id=p_id; end if;
    select count(*)::integer into total from public.catch_likes where catch_id=p_id;
    update public.pkm_catch_log set likes_count=total where id=p_id;
  else
    if p_liked then insert into public.series_likes(user_id,series_id) values(actor,p_id) on conflict(user_id,series_id) do nothing;
    else delete from public.series_likes where user_id=actor and series_id=p_id; end if;
    select count(*)::integer into total from public.series_likes where series_id=p_id;
    update public.pkm_series_log set likes_count=total where id=p_id;
  end if;
  return total;
end; $$;
revoke all on function public.set_community_like(text,uuid,boolean) from public, anon;
grant execute on function public.set_community_like(text,uuid,boolean) to authenticated;

create or replace function public.get_partner_leaderboard(p_dimension text default 'level')
returns table(pkm_id integer,pkm_name text,nickname text,exp integer,streak_days integer,bond integer,interaction_total integer)
language sql stable security definer set search_path = public, pg_temp as $$
  select p.pkm_id,p.pkm_name,p.nickname,p.exp,p.streak_days,p.bond,c.total
  from public.pkm_partner p cross join lateral (
    select least(2147483647,greatest(0,case when jsonb_typeof(p.interaction_counts->'total')='number'
      then (p.interaction_counts->>'total')::numeric else 0 end))::integer as total
  ) c where p.is_public
  order by case p_dimension when 'streak' then p.streak_days when 'bond' then p.bond
    when 'active' then c.total else p.exp end desc,
    p.id
  limit 20;
$$;
revoke all on function public.get_partner_leaderboard(text) from public;
grant execute on function public.get_partner_leaderboard(text) to anon, authenticated;

-- 约战关闭/过期后，作者仍能管理自己的记录。
drop policy if exists "community_match_posts_select_open" on public.community_match_posts;
create policy "community_match_posts_select_open" on public.community_match_posts for select
  using(user_id=auth.uid() or (status='open' and expires_at>now()));

-- 不允许通过战绩关联其他用户的私有队伍。
drop policy if exists "battle_records_insert_own" on public.battle_records;
create policy "battle_records_insert_own" on public.battle_records for insert
  with check(user_id=auth.uid() and (team_id is null or exists(select 1 from public.battle_teams t where t.id=team_id and t.user_id=auth.uid())));

-- 即使作者直接调用表API，也不能伪造点赞数量。
create or replace function public.enforce_reaction_count()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if tg_table_name='battle_teams' then select count(*)::integer into new.likes_count from public.team_likes where team_id=new.id;
  elsif tg_table_name='pkm_catch_log' then select count(*)::integer into new.likes_count from public.catch_likes where catch_id=new.id;
  else select count(*)::integer into new.likes_count from public.series_likes where series_id=new.id; end if;
  return new;
end; $$;
revoke all on function public.enforce_reaction_count() from public;
drop trigger if exists battle_teams_reaction_count on public.battle_teams;
create trigger battle_teams_reaction_count before insert or update on public.battle_teams for each row execute function public.enforce_reaction_count();
drop trigger if exists catch_reaction_count on public.pkm_catch_log;
create trigger catch_reaction_count before insert or update on public.pkm_catch_log for each row execute function public.enforce_reaction_count();
drop trigger if exists series_reaction_count on public.pkm_series_log;
create trigger series_reaction_count before insert or update on public.pkm_series_log for each row execute function public.enforce_reaction_count();

grant select on public.profiles,public.battle_teams,public.pkm_catch_log,public.pkm_series_log,public.team_comments to anon,authenticated;
grant insert,update,delete on public.profiles,public.team_comments to authenticated;
grant select,insert,update,delete on public.pkm_partner,public.battle_records,public.community_match_posts to authenticated;

-- 清理旧抓取示例可能留下的匿名写权限，保留公开只读数据。
do $$ begin
  if to_regclass('public.pkm_champions_teams') is not null then
    execute 'drop policy if exists anon_write on public.pkm_champions_teams';
    execute 'drop policy if exists anon_del on public.pkm_champions_teams';
    execute 'revoke insert,update,delete on public.pkm_champions_teams from anon,authenticated';
  end if;
end $$;
commit;
