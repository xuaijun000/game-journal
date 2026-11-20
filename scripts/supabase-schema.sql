-- PIXELFISH full Supabase schema.
-- Run this in Supabase SQL Editor before opening the app to other users.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platforms text[] not null default '{}'::text[],
  genres text[] not null default '{}'::text[],
  styles text[] not null default '{}'::text[],
  developer text,
  year integer,
  status text not null default 'wishlist',
  hours numeric not null default 0,
  completion text,
  rating integer not null default 0,
  review text,
  cover text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_library_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anime_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover text,
  status text not null default 'planned',
  episode_current integer not null default 0,
  episode_total integer,
  rating integer not null default 0,
  review text,
  genres text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manga_list (like public.anime_list including all);

create table if not exists public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ref_type text not null,
  ref_id text not null,
  ref_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_hours numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.play_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ref_type text not null,
  ref_id text not null,
  ref_name text,
  snapshot_text text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.play_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ref_type text not null,
  ref_id text not null,
  ref_name text,
  log_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_name text not null,
  content text,
  type text not null default 'moment',
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_timelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  game_name text,
  timeline_json jsonb not null default '{}'::jsonb,
  current_chapter_index integer not null default 0,
  current_node_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create table if not exists public.media_timelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id text not null,
  media_name text,
  media_type text not null,
  timeline_json jsonb not null default '{}'::jsonb,
  current_arc_index integer not null default 0,
  current_node_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

create table if not exists public.battle_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_name text not null,
  pokemon jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pkm_collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pkm_id integer not null,
  pkm_name text not null,
  status text not null,
  created_at timestamptz not null default now(),
  unique (user_id, pkm_id, status)
);

create table if not exists public.pkm_series_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id text not null,
  status text not null default 'none',
  start_date date,
  end_date date,
  play_hours integer not null default 0,
  ace_pokemon text,
  party jsonb not null default '[]'::jsonb,
  hunts jsonb not null default '[]'::jsonb,
  training_evs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, series_id)
);

create table if not exists public.pkm_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pkm_id integer not null default 0,
  pkm_name text not null,
  summary text not null,
  game_series text,
  created_at timestamptz not null default now()
);

create table if not exists public.pkm_explore_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id text not null,
  location text,
  weather text,
  time_of_day text,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.pkm_catch_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id text not null,
  pkm_id integer not null,
  pkm_name text not null,
  img text,
  nickname text,
  nature text,
  base_stats jsonb,
  ev_yields jsonb,
  ai_rec text,
  catch_location text,
  manual_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.pkm_partner (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pkm_id integer not null,
  pkm_name text not null,
  nickname text,
  level integer not null default 1,
  exp integer not null default 0,
  hunger integer not null default 80,
  mood integer not null default 75,
  energy integer not null default 80,
  bond integer not null default 0,
  last_interaction_at timestamptz not null default now(),
  streak_days integer not null default 1,
  last_checkin_date date not null default current_date,
  inventory jsonb not null default '{}'::jsonb,
  diary jsonb not null default '[]'::jsonb,
  daily_interactions jsonb not null default '{}'::jsonb,
  interaction_counts jsonb not null default '{}'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists games_user_created_idx on public.games (user_id, created_at desc);
create index if not exists game_library_views_user_updated_idx on public.game_library_views (user_id, updated_at desc);
create index if not exists anime_list_user_created_idx on public.anime_list (user_id, created_at desc);
create index if not exists manga_list_user_created_idx on public.manga_list (user_id, created_at desc);
create index if not exists play_sessions_user_ref_idx on public.play_sessions (user_id, ref_type, ref_id, started_at desc);
create index if not exists play_snapshots_user_ref_idx on public.play_snapshots (user_id, ref_type, ref_id, created_at desc);
create index if not exists play_logs_user_ref_idx on public.play_logs (user_id, ref_type, ref_id, created_at desc);
create index if not exists game_moments_user_created_idx on public.game_moments (user_id, created_at desc);
create index if not exists game_moments_game_name_idx on public.game_moments (user_id, game_name);
create index if not exists chat_summaries_user_game_idx on public.chat_summaries (user_id, game_id, created_at desc);
create index if not exists battle_teams_user_created_idx on public.battle_teams (user_id, created_at desc);
create index if not exists pkm_collection_user_idx on public.pkm_collection (user_id, pkm_id);
create index if not exists pkm_logs_user_created_idx on public.pkm_logs (user_id, created_at desc);
create index if not exists pkm_explore_log_user_series_idx on public.pkm_explore_log (user_id, series_id, created_at desc);
create index if not exists pkm_catch_log_user_series_idx on public.pkm_catch_log (user_id, series_id, created_at desc);

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at before update on public.games for each row execute function public.set_updated_at();
drop trigger if exists game_library_views_set_updated_at on public.game_library_views;
create trigger game_library_views_set_updated_at before update on public.game_library_views for each row execute function public.set_updated_at();
drop trigger if exists anime_list_set_updated_at on public.anime_list;
create trigger anime_list_set_updated_at before update on public.anime_list for each row execute function public.set_updated_at();
drop trigger if exists manga_list_set_updated_at on public.manga_list;
create trigger manga_list_set_updated_at before update on public.manga_list for each row execute function public.set_updated_at();
drop trigger if exists game_timelines_set_updated_at on public.game_timelines;
create trigger game_timelines_set_updated_at before update on public.game_timelines for each row execute function public.set_updated_at();
drop trigger if exists media_timelines_set_updated_at on public.media_timelines;
create trigger media_timelines_set_updated_at before update on public.media_timelines for each row execute function public.set_updated_at();
drop trigger if exists battle_teams_set_updated_at on public.battle_teams;
create trigger battle_teams_set_updated_at before update on public.battle_teams for each row execute function public.set_updated_at();
drop trigger if exists pkm_series_log_set_updated_at on public.pkm_series_log;
create trigger pkm_series_log_set_updated_at before update on public.pkm_series_log for each row execute function public.set_updated_at();
drop trigger if exists pkm_partner_set_updated_at on public.pkm_partner;
create trigger pkm_partner_set_updated_at before update on public.pkm_partner for each row execute function public.set_updated_at();

alter table public.games enable row level security;
alter table public.game_library_views enable row level security;
alter table public.anime_list enable row level security;
alter table public.manga_list enable row level security;
alter table public.play_sessions enable row level security;
alter table public.play_snapshots enable row level security;
alter table public.play_logs enable row level security;
alter table public.game_moments enable row level security;
alter table public.chat_summaries enable row level security;
alter table public.game_timelines enable row level security;
alter table public.media_timelines enable row level security;
alter table public.battle_teams enable row level security;
alter table public.pkm_collection enable row level security;
alter table public.pkm_series_log enable row level security;
alter table public.pkm_logs enable row level security;
alter table public.pkm_explore_log enable row level security;
alter table public.pkm_catch_log enable row level security;
alter table public.pkm_partner enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'games','game_library_views','anime_list','manga_list','play_sessions','play_snapshots','play_logs',
    'game_moments','chat_summaries','game_timelines','media_timelines','battle_teams','pkm_collection',
    'pkm_series_log','pkm_logs','pkm_explore_log','pkm_catch_log','pkm_partner'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', tbl || '_select_own', tbl);
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', tbl || '_select_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_insert_own', tbl);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', tbl || '_insert_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_update_own', tbl);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', tbl || '_update_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_delete_own', tbl);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', tbl || '_delete_own', tbl);
    execute format('grant select,insert,update,delete on public.%I to authenticated',tbl);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('game-screenshots', 'game-screenshots', true)
on conflict (id) do nothing;

drop policy if exists "game_screenshots_public_read" on storage.objects;
create policy "game_screenshots_public_read"
  on storage.objects for select
  using (bucket_id = 'game-screenshots');

drop policy if exists "game_screenshots_insert_own_folder" on storage.objects;
create policy "game_screenshots_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'game-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "game_screenshots_update_own_folder" on storage.objects;
create policy "game_screenshots_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'game-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'game-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "game_screenshots_delete_own_folder" on storage.objects;
create policy "game_screenshots_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'game-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
