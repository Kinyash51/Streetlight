-- Newsletter subscribers for Streetlight.
-- Run this in the Supabase SQL Editor before relying on the homepage signup.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'homepage',
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  referrer text,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_newsletter_subscribers_email_lower
  on public.newsletter_subscribers (lower(email));

create index if not exists idx_newsletter_subscribers_status
  on public.newsletter_subscribers(status);

alter table public.newsletter_subscribers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsletter_subscribers'
      and policyname = 'Anyone can join newsletter'
  ) then
    create policy "Anyone can join newsletter"
      on public.newsletter_subscribers
      for insert
      with check (
        status = 'subscribed'
        and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
      );
  end if;
end $$;
