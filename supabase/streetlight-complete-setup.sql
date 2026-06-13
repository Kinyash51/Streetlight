-- Streetlight complete Supabase schema.
-- Intended for a new project. Safe to run again after a partial setup.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text check (username is null or char_length(username) between 2 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  payment_provider text,
  provider_reference text,
  provider_payment_id text,
  amount_total integer check (amount_total is null or amount_total >= 0),
  currency text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null,
  payment_provider text,
  provider_subscription_id text,
  provider_customer_id text,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'homepage',
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  referrer text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  why_noir text,
  beta_experience text,
  feedback_strength text,
  can_finish_in_2_weeks boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  reviewed_at timestamptz,
  reading_deadline timestamptz,
  approved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null
    references public.beta_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_slug text not null,
  paragraph_index integer check (paragraph_index is null or paragraph_index >= 0),
  selected_text text,
  feedback_type text
    check (feedback_type in ('loved', 'confusing', 'pacing', 'character', 'world', 'prose', 'typo', 'other')),
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_chapter_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null
    references public.beta_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_slug text not null,
  rating integer not null check (rating between 1 and 5),
  attention_drop text,
  confusing text,
  memorable_moment text,
  continue_reading boolean,
  overall_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_slug)
);

create unique index if not exists orders_provider_reference_key
  on public.orders (payment_provider, provider_reference)
  where provider_reference is not null;

create index if not exists idx_orders_user_created
  on public.orders (user_id, created_at desc);

create unique index if not exists subscriptions_provider_id_key
  on public.subscriptions (payment_provider, provider_subscription_id)
  where provider_subscription_id is not null;

create index if not exists idx_subscriptions_user_created
  on public.subscriptions (user_id, created_at desc);

create index if not exists idx_subscriptions_customer
  on public.subscriptions (payment_provider, provider_customer_id)
  where provider_customer_id is not null;

create unique index if not exists idx_newsletter_subscribers_email_lower
  on public.newsletter_subscribers (lower(email));

create index if not exists idx_newsletter_subscribers_status
  on public.newsletter_subscribers (status);

create index if not exists idx_beta_applications_email
  on public.beta_applications (lower(email));

create index if not exists idx_beta_applications_status
  on public.beta_applications (status, created_at desc);

create unique index if not exists beta_applications_user_id_key
  on public.beta_applications (user_id)
  where user_id is not null;

create index if not exists idx_beta_feedback_application
  on public.beta_feedback (application_id, created_at);

create index if not exists idx_beta_feedback_user_chapter
  on public.beta_feedback (user_id, chapter_slug, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists newsletter_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_set_updated_at
before update on public.newsletter_subscribers
for each row execute function public.set_updated_at();

drop trigger if exists beta_applications_set_updated_at on public.beta_applications;
create trigger beta_applications_set_updated_at
before update on public.beta_applications
for each row execute function public.set_updated_at();

drop trigger if exists beta_feedback_set_updated_at on public.beta_feedback;
create trigger beta_feedback_set_updated_at
before update on public.beta_feedback
for each row execute function public.set_updated_at();

drop trigger if exists beta_chapter_reviews_set_updated_at on public.beta_chapter_reviews;
create trigger beta_chapter_reviews_set_updated_at
before update on public.beta_chapter_reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    left(nullif(
      coalesce(
        new.raw_user_meta_data ->> 'username',
        new.raw_user_meta_data ->> 'name',
        new.raw_user_meta_data ->> 'user_name',
        split_part(coalesce(new.email, ''), '@', 1)
      ),
      ''
    ), 40)
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, username)
select
  id,
  email,
  left(nullif(
    coalesce(
      raw_user_meta_data ->> 'username',
      raw_user_meta_data ->> 'name',
      raw_user_meta_data ->> 'user_name',
      split_part(coalesce(email, ''), '@', 1)
    ),
    ''
  ), 40)
from auth.users
on conflict (id) do update
  set email = excluded.email;

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.beta_applications enable row level security;
alter table public.beta_feedback enable row level security;
alter table public.beta_chapter_reviews enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own subscriptions" on public.subscriptions;
create policy "Users can read their own subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Anyone can join newsletter" on public.newsletter_subscribers;
create policy "Anyone can join newsletter"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    status = 'subscribed'
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

drop policy if exists "Anyone can submit beta applications" on public.beta_applications;
drop policy if exists "Authenticated users can apply for beta" on public.beta_applications;
create policy "Authenticated users can apply for beta"
  on public.beta_applications for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and char_length(name) between 1 and 120
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

drop policy if exists "Users can read their own beta application" on public.beta_applications;
create policy "Users can read their own beta application"
  on public.beta_applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Approved readers can manage their feedback" on public.beta_feedback;
create policy "Approved readers can manage their feedback"
  on public.beta_feedback for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  );

drop policy if exists "Approved readers can manage chapter reviews" on public.beta_chapter_reviews;
create policy "Approved readers can manage chapter reviews"
  on public.beta_chapter_reviews for all
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  );

revoke all on table
  public.profiles,
  public.orders,
  public.subscriptions,
  public.newsletter_subscribers,
  public.beta_applications,
  public.beta_feedback,
  public.beta_chapter_reviews
from anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.orders, public.subscriptions to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, insert on public.beta_applications to authenticated;
grant select, insert, update, delete on public.beta_feedback to authenticated;
grant select, insert, update on public.beta_chapter_reviews to authenticated;
