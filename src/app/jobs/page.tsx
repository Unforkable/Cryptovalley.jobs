import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { getActiveJobs } from "@/lib/supabase/queries";
import { JobCard } from "@/components/jobs/job-card";
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
    tag?: string;
    page?: string;
  }>;
}) {
  const { job_type, location_type, tag, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const { jobs, total, totalPages } = await getActiveJobs({
    job_type: job_type as JobType | undefined,
    location_type: location_type as JobLocation | undefined,
    tag,
    page: currentPage,
  });

  // Build the base href preserving current filters (without page param)
  const filterParams = new URLSearchParams();
  if (job_type) filterParams.set("job_type", job_type);
  if (location_type) filterParams.set("location_type", location_type);
  if (tag) filterParams.set("tag", tag);
  const baseHref = filterParams.toString()
    ? `/jobs?${filterParams.toString()}`
    : "/jobs";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">All Jobs</h1>
      <p className="mt-2 text-muted-foreground">
        Browse open positions from top crypto companies in Switzerland.
      </p>

      <div className="mt-8">
        <Suspense>
          <JobFilters jobType={job_type} locationType={location_type} tag={tag} />
        </Suspense>
      </div>

      <div className="mt-8">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "job" : "jobs"} found
        </p>
        {jobs.length > 0 ? (
          <>
            <div className="mt-4 flex flex-col gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseHref={baseHref}
              />
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed py-16 text-center">
            <Search className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No jobs found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
            {(job_type || location_type || tag) && (
              <Link
                href="/jobs"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Clear all filters
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Job alerts */}
      <div className="mt-16 rounded-xl border bg-muted/40 px-6 py-10 text-center">
        <h2 className="text-xl font-bold tracking-tight">
          Don&apos;t miss your next role
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get new crypto jobs in Switzerland delivered to your inbox.
        </p>
        <EmailSubscribeForm className="mt-5 flex flex-col items-center" />
      </div>
    </div>
  );
}
