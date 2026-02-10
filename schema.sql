create extension if not exists "pgcrypto";

create type lead_status as enum (
  'new',
  'proposal',
  'waiting',
  'follow-up',
  'won',
  'lost'
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  job_title text not null,
  platform text,
  status lead_status not null default 'new',
  last_contact date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on leads(user_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_leads_updated_at
before update on leads
for each row
execute function public.set_updated_at();

alter table leads enable row level security;

create policy "Leads are viewable by owner"
  on leads for select
  using (auth.uid() = user_id);

create policy "Leads are insertable by owner"
  on leads for insert
  with check (auth.uid() = user_id);

create policy "Leads are updatable by owner"
  on leads for update
  using (auth.uid() = user_id);

create policy "Leads are deletable by owner"
  on leads for delete
  using (auth.uid() = user_id);
