-- Task Manager schema. Run once in Supabase → SQL Editor.
-- Mirrors the old FastAPI model (backend/app/models/task.py) and its
-- validation (backend/app/schemas/task.py).

create type public.task_status as enum ('pending', 'completed');

create table public.tasks (
  id          bigint generated always as identity primary key,
  title       text not null
              check (char_length(btrim(title)) between 1 and 200),
  description text
              check (description is null or char_length(description) <= 2000),
  status      public.task_status not null default 'pending',
  created_at  timestamptz not null default now()
);

create index tasks_created_at_idx on public.tasks (created_at desc, id desc);

-- Dashboard counters (replaces GET /api/tasks/stats).
create view public.task_stats with (security_invoker = true) as
select
  count(*)::int                                     as total,
  count(*) filter (where status = 'pending')::int   as pending,
  count(*) filter (where status = 'completed')::int as completed
from public.tasks;

-- Demo mode: no login, so the public (anon) role may do everything.
-- To lock this down later, add Supabase Auth and replace these policies.
alter table public.tasks enable row level security;

create policy "public read"   on public.tasks for select to anon, authenticated using (true);
create policy "public insert" on public.tasks for insert to anon, authenticated with check (true);
create policy "public update" on public.tasks for update to anon, authenticated using (true) with check (true);
create policy "public delete" on public.tasks for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.tasks to anon, authenticated;
grant select on public.task_stats to anon, authenticated;
