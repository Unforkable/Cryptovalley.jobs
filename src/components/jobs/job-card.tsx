import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  if (min && max) return `${currency} ${fmt(min)}–${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const initials = job.company?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <Card
      className={cn(
        "rounded-xl py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-foreground/20",
        job.featured && "border-l-2 border-l-amber-400 bg-amber-50/30"
      )}
    >
      <CardContent className="flex gap-4">
        <Avatar size="lg" className="mt-0.5 shrink-0">
          {job.company?.logo_url && (
            <AvatarImage src={job.company.logo_url} alt={job.company.name} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {job.company && (
                <p className="text-sm text-muted-foreground">
                  {job.company.name}
                  {job.company.location && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5">
                      <MapPin className="inline size-3" />
                      {job.company.location}
                    </span>
                  )}
                </p>
              )}
              <Link
                href={`/jobs/${job.slug}`}
                className="text-base font-semibold tracking-tight hover:text-primary hover:underline"
              >
                {job.title}
              </Link>
            </div>
            {job.published_at && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(job.published_at)}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1">
              <Briefcase className="size-3" />
              {job.job_type}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="size-3" />
              {job.location_type}
            </Badge>
            {salary && (
              <Badge variant="secondary">{salary}</Badge>
            )}
            {job.featured && (
              <Badge className="bg-amber-500/15 text-amber-700 border-amber-200">
                Featured
              </Badge>
            )}
          </div>

          {job.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
