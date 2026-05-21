-- Run this in your Supabase project SQL editor
-- Dashboard > SQL Editor > New query

create table challenges (
  id uuid default gen_random_uuid() primary key,
  code char(6) unique not null,
  player_a_name text not null,
  player_a_reflex integer,
  player_a_tempo integer,
  player_a_code integer,
  bet text not null,
  player_b_name text,
  player_b_reflex integer,
  player_b_tempo integer,
  player_b_code integer,
  winner text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table challenges enable row level security;

create policy "public read"   on challenges for select using (true);
create policy "public insert" on challenges for insert with check (true);
create policy "public update" on challenges for update using (true);
