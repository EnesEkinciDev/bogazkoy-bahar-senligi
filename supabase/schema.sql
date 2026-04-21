create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  captain text not null,
  phone text not null,
  slogan text,
  players text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('groups', 'knockout')),
  group_count integer,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;
alter table public.draws enable row level security;

drop policy if exists "Approved teams are publicly visible" on public.teams;
create policy "Approved teams are publicly visible"
on public.teams for select
using (status = 'approved');

drop policy if exists "Draws are publicly visible" on public.draws;
create policy "Draws are publicly visible"
on public.draws for select
using (true);

create index if not exists teams_status_created_at_idx on public.teams (status, created_at);
create index if not exists draws_created_at_idx on public.draws (created_at desc);
