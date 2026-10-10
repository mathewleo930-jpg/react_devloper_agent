-- Soft delete: deleting a task sets deleted_at instead of removing the row,
-- so the Analytics tab can count deleted tasks.

alter table public.tasks add column deleted_at timestamptz;

-- Existing columns keep their names and order (required by create or replace
-- view) but now ignore deleted tasks; the new deleted column goes last.
create or replace view public.task_stats with (security_invoker = true) as
select
  count(*) filter (where deleted_at is null)::int                           as total,
  count(*) filter (where deleted_at is null and status = 'pending')::int    as pending,
  count(*) filter (where deleted_at is null and status = 'completed')::int  as completed,
  count(*) filter (where deleted_at is not null)::int                       as deleted
from public.tasks;
