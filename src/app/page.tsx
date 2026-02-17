import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
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

export default async function HomePage() {
  const [jobs, stats] = await Promise.all([
    getLatestJobs(6),
    getPublicStats(),
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Blockchain & Crypto Jobs
            <br />
            <span className="text-primary/70">in Crypto Valley</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Find your next role at the leading blockchain companies in
            Switzerland. From DeFi to infrastructure, Web3 to tokenization.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/post-job">Post a Job</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4" />
              <span>
                <span className="font-semibold text-foreground">
                  {stats.jobs}
                </span>{" "}
                open {stats.jobs === 1 ? "position" : "positions"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span>
                <span className="font-semibold text-foreground">
                  {stats.companies}
                </span>{" "}
                {stats.companies === 1 ? "company" : "companies"} hiring
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Jobs</h2>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </div>
        {jobs.length > 0 ? (
          <div className="mt-6 flex flex-col gap-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed py-12 text-center">
            <Briefcase className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No jobs posted yet. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* Email Subscribe */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:py-16">
          <h2 className="text-2xl font-bold">Get Job Alerts</h2>
          <p className="mt-2 text-muted-foreground">
            New crypto jobs in Switzerland, delivered to your inbox.
          </p>
          <EmailSubscribeForm className="mt-6 flex justify-center" />
        </div>
      </section>
    </div>
  );
}
