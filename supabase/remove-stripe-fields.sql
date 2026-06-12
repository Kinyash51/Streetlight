-- Run this only if the earlier Streetlight schema with Stripe columns
-- was already created. It preserves rows while making payment fields
-- provider-neutral for the next payment integration.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'stripe_checkout_session_id'
  ) then
    alter table public.orders
      rename column stripe_checkout_session_id to provider_reference;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'stripe_payment_intent_id'
  ) then
    alter table public.orders
      rename column stripe_payment_intent_id to provider_payment_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'stripe_subscription_id'
  ) then
    alter table public.subscriptions
      rename column stripe_subscription_id to provider_subscription_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'stripe_customer_id'
  ) then
    alter table public.subscriptions
      rename column stripe_customer_id to provider_customer_id;
  end if;
end;
$$;

alter table public.orders
  add column if not exists payment_provider text;

alter table public.subscriptions
  add column if not exists payment_provider text;

drop index if exists public.orders_stripe_checkout_session_id_key;
drop index if exists public.subscriptions_stripe_subscription_id_key;

create unique index if not exists orders_provider_reference_key
  on public.orders (payment_provider, provider_reference)
  where provider_reference is not null;

create unique index if not exists subscriptions_provider_id_key
  on public.subscriptions (payment_provider, provider_subscription_id)
  where provider_subscription_id is not null;

drop table if exists public.payment_attempts;
drop table if exists public.scheduled_emails;

alter table public.subscriptions
  drop column if exists welcome_email_sent,
  drop column if exists last_invoice_email_sent;
