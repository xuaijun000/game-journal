-- Saved filter/view presets for the game library.
-- Run this in Supabase SQL Editor.

create table if not exists public.game_library_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_library_views_user_updated_idx
  on public.game_library_views (user_id, updated_at desc);

alter table public.game_library_views enable row level security;

drop policy if exists "game_library_views_select_own" on public.game_library_views;
create policy "game_library_views_select_own"
  on public.game_library_views for select
  using (auth.uid() = user_id);

drop policy if exists "game_library_views_insert_own" on public.game_library_views;
create policy "game_library_views_insert_own"
  on public.game_library_views for insert
  with check (auth.uid() = user_id);

drop policy if exists "game_library_views_update_own" on public.game_library_views;
create policy "game_library_views_update_own"
  on public.game_library_views for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "game_library_views_delete_own" on public.game_library_views;
create policy "game_library_views_delete_own"
  on public.game_library_views for delete
  using (auth.uid() = user_id);
