-- Optional email automation tracking for Streetlight.
-- The app can send webhook emails without this file, but these columns/tables
-- are useful when you want to track sent emails and failed payment attempts.

alter table public.subscriptions
  add column if not exists welcome_email_sent boolean default false,
  add column if not exists last_invoice_email_sent timestamptz,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists canceled_at timestamptz;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  invoice_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  attempt_number integer not null default 1,
  status text not null check (status in ('failed', 'recovered', 'abandoned')),
  email_sent boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_payment_attempts_invoice
  on public.payment_attempts(invoice_id);

create index if not exists idx_payment_attempts_user
  on public.payment_attempts(user_id);

create table if not exists public.scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email_type text not null check (email_type in ('winback', 'renewal_reminder', 'trial_expiring')),
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  created_at timestamptz default now()
);

create index if not exists idx_scheduled_emails_pending
  on public.scheduled_emails(status, scheduled_for)
  where status = 'pending';

alter table public.payment_attempts enable row level security;
alter table public.scheduled_emails enable row level security;
