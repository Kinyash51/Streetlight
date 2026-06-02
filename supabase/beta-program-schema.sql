-- Beta program schema for Streetlight.
-- Run this in the Supabase SQL Editor before opening /beta to readers.

create table if not exists public.beta_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  why_noir text,
  beta_experience text,
  feedback_strength text,
  can_finish_in_2_weeks boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create index if not exists idx_beta_applications_email
  on public.beta_applications(email);

create index if not exists idx_beta_applications_status
  on public.beta_applications(status);

alter table public.beta_applications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'beta_applications'
      and policyname = 'Anyone can submit beta applications'
  ) then
    create policy "Anyone can submit beta applications"
      on public.beta_applications
      for insert
      with check (true);
  end if;
end $$;

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.beta_applications(id) on delete cascade,
  chapter text,
  paragraph_index integer,
  feedback_type text check (feedback_type in ('plot', 'character', 'pacing', 'prose', 'world', 'typo', 'other')),
  comment text not null,
  created_at timestamptz default now()
);

create index if not exists idx_beta_feedback_application
  on public.beta_feedback(application_id);

alter table public.beta_feedback enable row level security;
