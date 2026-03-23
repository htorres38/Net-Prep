create extension if not exists pgcrypto;

-- users

create table if not exists public.users (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- lesson_progress

create table if not exists public.lesson_progress (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  lesson_id    text        not null,
  completed_at timestamptz not null default now(),

  constraint lesson_progress_user_lesson_unique unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_id_idx on public.lesson_progress (user_id);

-- lab_progress

create table if not exists public.lab_progress (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users (id) on delete cascade,
  lab_id          text        not null,
  completed_at    timestamptz not null default now(),
  score           integer,
  total_questions integer,

  constraint lab_progress_user_lab_unique unique (user_id, lab_id)
);

create index if not exists lab_progress_user_id_idx on public.lab_progress (user_id);

-- notes

create table if not exists public.notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users (id) on delete cascade,
  lesson_id  text        not null,
  content    text        not null default '',
  updated_at timestamptz not null default now(),

  constraint notes_user_lesson_unique unique (user_id, lesson_id)
);

create index if not exists notes_user_id_idx on public.notes (user_id);

-- study_streaks

create table if not exists public.study_streaks (
  user_id         uuid    primary key references public.users (id) on delete cascade,
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  last_study_date date,
  updated_at      timestamptz not null default now()
);

-- final_exam_results

create table if not exists public.final_exam_results (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users (id) on delete cascade,
  score           integer     not null,
  total_questions integer     not null default 66,
  passed          boolean     not null,
  completed_at    timestamptz not null default now(),

  constraint final_exam_results_user_unique unique (user_id)
);

create index if not exists final_exam_results_user_id_idx on public.final_exam_results (user_id);

-- ─── Auth integration ────────────────────────────────────────────────────────
--
-- When a user creates an account via Supabase Auth, a trigger automatically
-- inserts matching rows into public.users (for FK compatibility) and
-- public.profiles (for display metadata like email).
--
-- Guest users continue using the temp-UUID path in db.ts and are inserted
-- directly into public.users by the app — no trigger needed for them.

-- profiles — stores auth user display metadata (email)
create table if not exists public.profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- Trigger function: runs after a new Supabase Auth user is created
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Ensure a matching row exists in public.users so FK constraints are satisfied
  insert into public.users (id) values (new.id) on conflict (id) do nothing;
  -- Store the email in profiles for display in the UI
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop and recreate the trigger so re-running this script is idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- ─── Account self-service ─────────────────────────────────────────────────────

-- Allows an authenticated user to delete their own account.
-- Cascades automatically clean up public.users, public.profiles, and all
-- progress tables via their ON DELETE CASCADE foreign keys.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;


create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;


grant execute on function public.delete_own_account() to authenticated;
