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

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  if (min && max) return `${currency} ${fmt(min)}–${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.company?.name ?? "Unknown"}`,
    description: job.description.slice(0, 160),
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
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
          <h1 className="text-3xl font-bold">{job.title}</h1>

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

          <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {job.description}
          </div>

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
          <Card>
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
                    className="font-semibold hover:underline"
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

              <Button asChild className="w-full">
                <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                  Apply Now
                </a>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                You&apos;ll apply on the company&apos;s website
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
