-- CryptoValley.jobs Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Companies table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  website text,
  description text,
  location text,
  created_at timestamptz default now() not null
);

-- Jobs table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  slug text not null unique,
  description text not null,
  job_type text not null check (job_type in ('full-time', 'part-time', 'contract', 'internship')),
  location_type text not null check (location_type in ('remote', 'onsite', 'hybrid')),
  location text,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'CHF' not null,
  apply_url text not null,
  tags text[] default '{}' not null,
  status text default 'pending' not null check (status in ('draft', 'pending', 'active', 'expired', 'rejected')),
  featured boolean default false not null,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now() not null
);

-- Email subscriptions table
create table public.email_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  tags text[] default '{}' not null,
  job_types text[] default '{}' not null,
  location_types text[] default '{}' not null,
  confirmed boolean default false not null,
  confirmation_token uuid default uuid_generate_v4(),
  created_at timestamptz default now() not null
);

-- Stripe payments table (tracks job posting payments)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete set null,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  amount integer not null,
  currency text default 'chf' not null,
  status text default 'pending' not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz default now() not null
);

-- Indexes
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_company_id on public.jobs(company_id);
create index idx_jobs_published_at on public.jobs(published_at desc);
create index idx_jobs_tags on public.jobs using gin(tags);
create index idx_companies_slug on public.companies(slug);
create index idx_jobs_slug on public.jobs(slug);

-- Row Level Security
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.email_subscriptions enable row level security;
alter table public.payments enable row level security;

-- Public read access for active jobs and companies
create policy "Public can view companies" on public.companies
  for select using (true);

create policy "Public can view active jobs" on public.jobs
  for select using (status in ('active', 'expired'));

-- Service role has full access (for admin operations via API routes)
-- Note: Supabase service role key bypasses RLS by default
