-- RepRelay schema. Each table stores the app's JSON document in `data`
-- (shape defined in packages/core/src/types.ts) and is private to its owner.

create table if not exists public.routines (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.gyms (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists routines_user_idx on public.routines (user_id, updated_at desc);
create index if not exists gyms_user_idx on public.gyms (user_id, updated_at desc);
create index if not exists sessions_user_idx on public.sessions (user_id, updated_at desc);

do $$
declare t text;
begin
  foreach t in array array['routines', 'gyms', 'sessions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
