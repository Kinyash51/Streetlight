-- Upgrade an existing Streetlight project with authenticated beta access
-- and private paragraph/chapter feedback.

alter table public.beta_applications
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reading_deadline timestamptz;

create unique index if not exists beta_applications_user_id_key
  on public.beta_applications (user_id)
  where user_id is not null;

drop trigger if exists beta_applications_set_updated_at
  on public.beta_applications;
create trigger beta_applications_set_updated_at
before update on public.beta_applications
for each row execute function public.set_updated_at();

alter table public.beta_feedback
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists chapter_slug text,
  add column if not exists selected_text text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.beta_feedback
  drop constraint if exists beta_feedback_feedback_type_check;

alter table public.beta_feedback
  add constraint beta_feedback_feedback_type_check
  check (
    feedback_type in (
      'loved',
      'confusing',
      'pacing',
      'character',
      'world',
      'prose',
      'typo',
      'other'
    )
  );

create index if not exists idx_beta_feedback_user_chapter
  on public.beta_feedback (user_id, chapter_slug, created_at desc);

drop trigger if exists beta_feedback_set_updated_at on public.beta_feedback;
create trigger beta_feedback_set_updated_at
before update on public.beta_feedback
for each row execute function public.set_updated_at();

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

drop trigger if exists beta_chapter_reviews_set_updated_at
  on public.beta_chapter_reviews;
create trigger beta_chapter_reviews_set_updated_at
before update on public.beta_chapter_reviews
for each row execute function public.set_updated_at();

alter table public.beta_chapter_reviews enable row level security;

drop policy if exists "Users can read their own beta application"
  on public.beta_applications;
create policy "Users can read their own beta application"
  on public.beta_applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Authenticated users can apply for beta"
  on public.beta_applications;
create policy "Authenticated users can apply for beta"
  on public.beta_applications for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and char_length(name) between 1 and 120
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

drop policy if exists "Anyone can submit beta applications"
  on public.beta_applications;

drop policy if exists "Approved readers can read their feedback"
  on public.beta_feedback;
create policy "Approved readers can read their feedback"
  on public.beta_feedback for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  );

drop policy if exists "Approved readers can submit feedback"
  on public.beta_feedback;
create policy "Approved readers can submit feedback"
  on public.beta_feedback for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  );

drop policy if exists "Approved readers can update their feedback"
  on public.beta_feedback;
create policy "Approved readers can update their feedback"
  on public.beta_feedback for update
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

drop policy if exists "Approved readers can delete their feedback"
  on public.beta_feedback;
create policy "Approved readers can delete their feedback"
  on public.beta_feedback for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  );

drop policy if exists "Approved readers can read chapter reviews"
  on public.beta_chapter_reviews;
create policy "Approved readers can read chapter reviews"
  on public.beta_chapter_reviews for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Approved readers can submit chapter reviews"
  on public.beta_chapter_reviews;
create policy "Approved readers can submit chapter reviews"
  on public.beta_chapter_reviews for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beta_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
        and application.status in ('approved', 'completed')
    )
  );

drop policy if exists "Approved readers can update chapter reviews"
  on public.beta_chapter_reviews;
create policy "Approved readers can update chapter reviews"
  on public.beta_chapter_reviews for update
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
  public.beta_applications,
  public.beta_feedback,
  public.beta_chapter_reviews
from anon, authenticated;

grant select, insert on public.beta_applications to authenticated;
grant select, insert, update, delete on public.beta_feedback to authenticated;
grant select, insert, update on public.beta_chapter_reviews to authenticated;
