-- Visitor feedback from the landing page (src/api/feedback.js).
-- Checks mirror the client rules in src/lib/feedback.js.

create table public.feedback (
  id          bigint generated always as identity primary key,
  rating      smallint not null check (rating between 1 and 5),
  topic       text not null check (topic in ('General', 'Feature request', 'Bug report', 'Pricing', 'Ease of use')),
  message     text not null check (char_length(btrim(message)) between 10 and 2000),
  email       text check (email is null or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  created_at  timestamptz not null default now()
);

-- Anyone may submit, nobody may read through the API: submissions can hold
-- email addresses, so they are read in the Supabase dashboard only.
alter table public.feedback enable row level security;
create policy "public insert" on public.feedback for insert to anon, authenticated with check (true);
grant insert on public.feedback to anon, authenticated;
