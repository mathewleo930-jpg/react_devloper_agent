-- Task priority; existing rows become 'medium'.
create type public.task_priority as enum ('low', 'medium', 'high');
alter table public.tasks add column priority public.task_priority not null default 'medium';
