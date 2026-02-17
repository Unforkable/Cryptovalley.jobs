# CryptoValley.jobs

A job board for blockchain and crypto companies in Switzerland's Crypto Valley.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Payments**: Stripe (for job posting fees)
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── jobs/              # Job listing & detail pages
│   ├── companies/         # Company listing & detail pages
│   ├── post-job/          # Job posting flow (with Stripe)
│   ├── admin/             # Admin dashboard (auth-protected)
│   ├── auth/              # Auth routes (login, callback)
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components (auto-generated)
│   ├── layout/            # Header, footer, nav
│   ├── jobs/              # Job-specific components
│   └── companies/         # Company-specific components
├── lib/
│   ├── supabase/          # Supabase client (browser, server, middleware)
│   └── stripe/            # Stripe helpers
└── types/                 # TypeScript type definitions
```

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Conventions

- Use Server Components by default; add `"use client"` only when needed
- Supabase server client: `import { createClient } from "@/lib/supabase/server"`
- Supabase browser client: `import { createClient } from "@/lib/supabase/client"`
- Use `@/` import alias for all project imports
- Component files: kebab-case (`job-card.tsx`)
- Types are in `src/types/index.ts`
- shadcn/ui components live in `src/components/ui/` — don't edit these manually
- Database schema is in `supabase/schema.sql`

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.
Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database

Schema: `supabase/schema.sql`
Seed data: `supabase/seed.sql`
Run these in the Supabase SQL editor to set up your database.
