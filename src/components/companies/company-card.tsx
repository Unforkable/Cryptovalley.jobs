import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/companies/company-logo";
import type { Company } from "@/types";

export function CompanyCard({
  company,
}: {
  company: Company & { job_count?: number };
}) {
  const jobCount = company.job_count ?? 0;

  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className="h-full rounded-xl py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="flex flex-col items-center text-center">
          <CompanyLogo name={company.name} logoUrl={company.logo_url} className="mb-3" />
          <h3 className="font-semibold">{company.name}</h3>
          {company.location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3" />
              {company.location}
            </p>
          )}
          {company.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {company.description}
            </p>
          )}
          {jobCount > 0 && (
            <Badge
              variant="secondary"
              className="mt-3 bg-primary/10 text-primary"
            >
              {jobCount} open {jobCount === 1 ? "position" : "positions"}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
