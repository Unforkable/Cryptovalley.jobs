import type { Metadata } from "next";
import Link from "next/link";
import { JobList } from "@/components/jobs/job-card";
import { EmailSubscribeForm } from "@/components/jobs/email-subscribe-form";
import { getLatestJobs, getPublicStats } from "@/lib/supabase/queries";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

export const metadata: Metadata = {
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "CryptoValley.jobs - Blockchain & Crypto Jobs in Switzerland",
    description:
      "Find the best blockchain, crypto, and Web3 jobs in Switzerland's Crypto Valley. Browse opportunities from top companies in Zug, Zurich, and beyond.",
    url: BASE_URL,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CryptoValley.jobs",
  url: BASE_URL,
  description:
    "Job board for blockchain and crypto companies in Switzerland's Crypto Valley.",
};

// Every open role fits on the homepage for now; /jobs has filters and paging
const HOME_LIMIT = 50;

export default async function HomePage() {
  const [jobs, stats] = await Promise.all([
    getLatestJobs(HOME_LIMIT),
    getPublicStats(),
  ]);

  const headline =
    stats.jobs > 0
      ? `${stats.jobs} open ${stats.jobs === 1 ? "role" : "roles"} in Crypto Valley`
      : "Crypto jobs in Crypto Valley";

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Hero: the one loud thing on the site */}
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-14 sm:pt-20 lg:grid-cols-12 lg:items-end lg:pb-12">
          <h1 className="font-condensed text-[clamp(3.25rem,11vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.015em] text-balance lg:col-span-8">
            {headline}
          </h1>
          <div className="lg:col-span-4">
            <p className="max-w-sm text-[17px] leading-relaxed">
              Crypto and blockchain jobs in Switzerland, plus remote roles open
              to people living here. Updated every morning.
            </p>
            <form action="/jobs" role="search" className="mt-5 flex max-w-md">
              <input
                name="q"
                type="search"
                placeholder="Role, company or city"
                aria-label="Search jobs"
                className="h-11 min-w-0 flex-1 rounded-l-sm bg-white px-3 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              />
              <button
                type="submit"
                className="h-11 rounded-r-sm bg-foreground px-5 text-[15px] font-medium text-background hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {jobs.length > 0 ? (
          <>
            <JobList jobs={jobs} />
            <p className="mt-6 text-[15px]">
              <Link href="/jobs" className="font-medium underline underline-offset-4 hover:no-underline">
                {stats.jobs > jobs.length
                  ? `See all ${stats.jobs} jobs`
                  : "Filter by job type or workplace"}
              </Link>
            </p>
          </>
        ) : (
          <div className="border-y py-12">
            <p className="text-lg font-semibold">No open roles today</p>
            <p className="mt-1 max-w-md text-muted-foreground">
              New roles are added every morning. Get them by email below, or{" "}
              <Link href="/post-job" className="text-foreground underline underline-offset-4">
                post a job
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <h2 className="font-condensed text-4xl font-extrabold leading-none tracking-[-0.01em]">
              Get new roles by email
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              One short email on mornings when new jobs are added.
            </p>
          </div>
          <EmailSubscribeForm className="lg:col-span-6" />
        </div>
      </section>
    </div>
  );
}
