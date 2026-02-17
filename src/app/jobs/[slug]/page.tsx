import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Briefcase, ExternalLink, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getJobBySlug } from "@/lib/supabase/queries";
import { sanitizeHtml, containsHtml } from "@/lib/sanitize-html";
import type { Job } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

const EMPTY_DESCRIPTIONS = new Set([
  "See job posting for details.",
  "See job posting for details",
  "",
]);

function JobDescription({ description, applyUrl }: { description: string; applyUrl: string }) {
  const isEmpty = EMPTY_DESCRIPTIONS.has(description.trim());

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground">
          Full job description is available on the company&apos;s website.
        </p>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View full description & apply
          <ExternalLink className="size-3" />
        </a>
      </div>
    );
  }

  if (containsHtml(description)) {
    return (
      <div
        className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
    );
  }

  return (
    <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed">
      {description}
    </div>
  );
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  if (min && max) return `${currency} ${fmt(min)}–${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildJobPostingSchema(job: Job) {
  const description = containsHtml(job.description)
    ? stripHtml(job.description)
    : job.description;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    url: `${BASE_URL}/jobs/${job.slug}`,
    employmentType: EMPLOYMENT_TYPE_MAP[job.job_type] ?? "OTHER",
    directApply: false,
  };

  if (job.published_at) schema.datePosted = job.published_at;
  if (job.expires_at) schema.validThrough = job.expires_at;

  if (job.company) {
    const org: Record<string, unknown> = {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.company.website ?? undefined,
    };
    if (job.company.logo_url) org.logo = job.company.logo_url;
    schema.hiringOrganization = org;
  }

  if (job.location) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "CH",
      },
    };
  }

  if (job.location_type === "remote") {
    schema.jobLocationType = "TELECOMMUTE";
  }

  if (job.salary_min || job.salary_max) {
    const value: Record<string, unknown> = {
      "@type": "QuantitativeValue",
      unitText: "YEAR",
    };
    if (job.salary_min && job.salary_max) {
      value.minValue = job.salary_min;
      value.maxValue = job.salary_max;
    } else if (job.salary_min) {
      value.value = job.salary_min;
    } else {
      value.value = job.salary_max;
    }
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary_currency,
      value,
    };
  }

  return schema;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };

  const companyName = job.company?.name ?? "Unknown";
  const title = `${job.title} at ${companyName}`;
  const rawDesc = containsHtml(job.description)
    ? stripHtml(job.description)
    : job.description;
  const description = rawDesc.length > 155
    ? rawDesc.slice(0, 155).trimEnd() + "..."
    : rawDesc;
  const url = `${BASE_URL}/jobs/${job.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${job.title} in ${job.location ?? "Switzerland"} | ${companyName} | Apply Now`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const company = job.company;
  const initials = company?.name?.slice(0, 2).toUpperCase() ?? "??";

  const jsonLd = buildJobPostingSchema(job);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 pb-24 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        All Jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-extrabold tracking-tight">{job.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Briefcase className="size-3" />
              {job.job_type}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="size-3" />
              {job.location_type}
            </Badge>
            {job.location && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="size-3" />
                {job.location}
              </Badge>
            )}
          </div>

          {salary && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Salary
                </h3>
                <p className="mt-1 text-lg font-semibold">{salary}</p>
              </div>
            </>
          )}

          <Separator className="my-6" />

          <JobDescription description={job.description} applyUrl={job.apply_url} />

          {job.tags.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <Card className="sticky top-20 rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center text-center">
              <Avatar size="lg" className="mb-3">
                {company?.logo_url && (
                  <AvatarImage src={company.logo_url} alt={company.name} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {company && (
                <>
                  <Link
                    href={`/companies/${company.slug}`}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    {company.name}
                  </Link>
                  {company.location && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3" />
                      {company.location}
                    </p>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3" />
                      Website
                    </a>
                  )}
                </>
              )}

              <Separator className="my-4" />

              <Button asChild className="hidden w-full rounded-xl lg:inline-flex">
                <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                  Apply Now
                </a>
              </Button>
              <p className="mt-2 hidden text-xs text-muted-foreground lg:block">
                You&apos;ll apply on the company&apos;s website
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Sticky mobile apply button */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button asChild size="lg" className="w-full rounded-xl shadow-md">
          <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
            Apply Now
          </a>
        </Button>
      </div>
    </div>
  );
}
