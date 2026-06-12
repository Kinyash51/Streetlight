# Streetlight Supabase Reconnection

This guide rebuilds Streetlight against a fresh Supabase project.

## What Supabase Stores

The application currently needs these tables:

- `profiles`: reader email and display name.
- `orders`: provider-neutral one-time eBook purchases.
- `subscriptions`: provider-neutral Supporter and Patron access.
- `newsletter_subscribers`: homepage newsletter signups.
- `beta_applications`: public beta-reader applications.
- `beta_feedback`: future paragraph-level beta feedback.

Reader highlights and reading progress are still stored in the browser, not Supabase.
No Supabase Storage bucket is currently required.

## 1. Create the Supabase Project

1. Create a new project at `https://database.new`.
2. Save the database password somewhere private.
3. Wait until the project reports that it is healthy.

## 2. Run the Database SQL

Open **SQL Editor**, create a query, paste the full contents of:

`supabase/streetlight-complete-setup.sql`

Run it once. The script is idempotent, so it can be rerun after a partial failure.

It creates tables, indexes, RLS policies, timestamp triggers, and the missing
`auth.users` to `public.profiles` synchronization trigger.

If you already ran the earlier version containing Stripe-specific columns, run
this immediately afterward:

`supabase/remove-stripe-fields.sql`

That migration preserves existing order/subscription rows while renaming their
payment fields for the next provider.

## 3. Copy API Keys

Open **Project Settings > API Keys**.

Recommended new-key setup:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY
NEXT_PUBLIC_SITE_URL=https://streetlightstory.site
APP_URL=https://streetlightstory.site
```

The variable names are retained for compatibility with the current code:

- Put the Supabase **publishable key** in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Put the Supabase **secret key** in `SUPABASE_SERVICE_ROLE_KEY`.

Legacy `anon` and `service_role` values also work, but Supabase recommends the
new publishable and secret keys for new projects.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or commit it to Git.

## 4. Configure Auth URLs

Open **Authentication > URL Configuration**.

Set:

```text
Site URL:
https://streetlightstory.site

Redirect URLs:
https://streetlightstory.site/auth/callback
https://streetlightstory.site/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

The wildcard entries support callback `next` parameters and preview/testing
routes. Keep production and localhost entries; remove unknown domains.

## 5. Configure Email and Password Auth

Open **Authentication > Sign In / Providers > Email**:

1. Enable Email provider.
2. Enable email confirmations for production.
3. Set the minimum password length to at least 8.

For production, configure custom SMTP under **Authentication > Emails > SMTP**.
Supabase's default sender is rate-limited and intended for testing.

## 6. Configure Google Login

1. In Google Cloud, create an OAuth client of type **Web application**.
2. Add `https://streetlightstory.site` as an authorized JavaScript origin.
3. In Supabase, open **Authentication > Sign In / Providers > Google**.
4. Copy the callback URL shown by Supabase. It has this format:

   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

5. Add that exact URL as Google's authorized redirect URI.
6. Paste the Google client ID and secret into Supabase and enable Google.

## 7. Configure GitHub Login

1. In GitHub, open **Settings > Developer settings > OAuth Apps**.
2. Create an OAuth app:
   - Homepage: `https://streetlightstory.site`
   - Callback: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. Copy its client ID and client secret.
4. Open **Authentication > Sign In / Providers > GitHub** in Supabase.
5. Paste both values and enable GitHub.

## 8. Add Variables Locally

Replace the Supabase values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY
```

Restart `npm run dev` after changing environment variables.

## 9. Add Variables to Vercel

Open the Streetlight Vercel project:

**Settings > Environment Variables**

Add these Supabase and site URL variables for Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
APP_URL
```

Redeploy after saving them. Environment changes do not modify an existing
deployment.

## 10. Payment Status

Paid checkout is intentionally disabled while the new payment provider is being
connected. The `orders` and `subscriptions` tables remain in place with neutral
provider fields so payment access can be restored without another database reset.

## 11. Verification Order

Test in this order:

1. Submit the homepage newsletter form.
2. Submit `/beta`.
3. Create an email/password account and confirm its email.
4. Verify a matching row appears in `public.profiles`.
5. Sign out and back in.
6. Test Google login.
7. Test GitHub login.
8. Update the display name on `/account`.
9. Confirm the signed-in user can read only their own purchase data.

Useful SQL checks:

```sql
select id, email, username, created_at from public.profiles order by created_at desc;
select email, source, status, created_at from public.newsletter_subscribers order by created_at desc;
select name, email, status, created_at from public.beta_applications order by created_at desc;
select user_id, product, status, created_at from public.orders order by created_at desc;
select user_id, tier, status, created_at from public.subscriptions order by created_at desc;
```

## 12. Important Reset Warning

A brand-new Supabase project has a different project URL, keys, Auth users, and
OAuth callback URL. Existing users will not automatically exist in the new
project unless you migrate the `auth` schema. If this is a true clean reset,
readers must create accounts again.
