-- Job alerts: track which jobs have been included in an email digest.
-- Run this in the Supabase SQL editor.

alter table public.jobs add column if not exists alerted_at timestamptz;

create index if not exists idx_jobs_unalerted
  on public.jobs(published_at)
  where alerted_at is null;
