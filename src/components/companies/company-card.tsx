import Link from "next/link";
import { CompanyLogo } from "@/components/companies/company-logo";
import type { Company } from "@/types";

/** One cell of the companies grid; the grid draws the shared hairlines. */
export function CompanyCard({
  company,
}: {
  company: Company & { job_count?: number };
}) {
  const jobCount = company.job_count ?? 0;

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group flex h-full gap-4 border-b border-r p-5 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground"
    >
      <CompanyLogo name={company.name} logoUrl={company.logo_url} />
      <div className="min-w-0">
        <h3 className="font-semibold group-hover:underline">{company.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {jobCount > 0
            ? `${jobCount} open ${jobCount === 1 ? "role" : "roles"}`
            : "No open roles"}
          {company.location && <span className="ml-3">{company.location}</span>}
        </p>
        {company.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {company.description}
          </p>
        )}
      </div>
    </Link>
  );
}
