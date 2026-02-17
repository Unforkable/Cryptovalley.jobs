import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { JobCard } from "@/components/jobs/job-card";
import { getCompanyBySlug, getJobsByCompany } from "@/lib/supabase/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return { title: "Company Not Found" };
  return {
    title: company.name,
    description:
      company.description?.slice(0, 160) ??
      `View ${company.name}'s profile and open positions.`,
  };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const jobs = await getJobsByCompany(company.id);
  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/companies"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        All Companies
      </Link>

      <div className="flex items-start gap-6">
        <Avatar className="size-16 shrink-0 rounded-lg">
          {company.logo_url && (
            <AvatarImage src={company.logo_url} alt={company.name} />
          )}
          <AvatarFallback className="rounded-lg text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {company.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {company.location}
              </span>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {company.description && (
        <>
          <Separator className="my-8" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {company.description}
          </p>
        </>
      )}

      <Separator className="my-8" />

      <h2 className="text-xl font-bold">
        Open Positions ({jobs.length})
      </h2>

      {jobs.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground">
          No open positions at the moment.
        </p>
      )}
    </div>
  );
}
