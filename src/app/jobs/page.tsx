import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getActiveJobs } from "@/lib/supabase/queries";
import { JobList } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { EmailSubscribeForm } from "@/components/jobs/email-subscribe-form";
import type { JobType, JobLocation } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Browse blockchain, crypto, and Web3 job openings in Switzerland's Crypto Valley.",
  alternates: { canonical: `${BASE_URL}/jobs` },
  openGraph: {
    title: "Browse Blockchain & Crypto Jobs | CryptoValley.jobs",
    description:
      "Browse blockchain, crypto, and Web3 job openings in Switzerland's Crypto Valley.",
    url: `${BASE_URL}/jobs`,
  },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    job_type?: string;
    location_type?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const { job_type, location_type, q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const { jobs, total, totalPages } = await getActiveJobs({
    job_type: job_type as JobType | undefined,
    location_type: location_type as JobLocation | undefined,
    q,
    page: currentPage,
  });

  // Build the base href preserving current filters (without page param)
  const filterParams = new URLSearchParams();
  if (job_type) filterParams.set("job_type", job_type);
  if (location_type) filterParams.set("location_type", location_type);
  if (q) filterParams.set("q", q);
  const baseHref = filterParams.toString()
    ? `/jobs?${filterParams.toString()}`
    : "/jobs";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="font-condensed text-5xl font-extrabold leading-none tracking-[-0.01em] sm:text-6xl">
        All jobs
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Open roles at crypto and blockchain companies in Switzerland, plus
        remote roles open to people living here.
      </p>

      <div className="mt-8">
        <Suspense>
          <JobFilters jobType={job_type} locationType={location_type} q={q} />
        </Suspense>
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {total} {total === 1 ? "job" : "jobs"}
          {q && <> matching &ldquo;{q}&rdquo;</>}
        </p>
        {jobs.length > 0 ? (
          <>
            <JobList jobs={jobs} />
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseHref={baseHref}
              />
            </div>
          </>
        ) : (
          <div className="border-y py-12">
            <p className="text-lg font-semibold">No jobs match these filters</p>
            <p className="mt-1 text-muted-foreground">
              Try a shorter search or a different job type.
            </p>
            {(job_type || location_type || q) && (
              <Link
                href="/jobs"
                className="mt-4 inline-block font-medium underline underline-offset-4 hover:no-underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Job alerts */}
      <div className="mt-16 grid gap-6 border-t pt-10 lg:grid-cols-12 lg:items-end">
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
    </div>
  );
}
