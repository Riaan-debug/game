-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  world_json jsonb not null,
  version integer not null default 5,
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;

create policy "Users read own save"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "Users insert own save"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "Users update own save"
  on public.saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own save"
  on public.saves for delete
  using (auth.uid() = user_id);
