import Link from "next/link";
import { CompanyLogo } from "@/components/companies/company-logo";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  if (min && max) return `${currency} ${fmt(min)}–${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

// "Zug, Zug, Switzerland" → "Zug"; "Geneva, Switzerland" → "Geneva";
// "Remote - Europe Timezone" → "Remote, Europe".
// Every job here is Swiss or remote, so the country adds nothing.
function shortLocation(location: string | null) {
  if (!location) return null;
  const parts = location
    .replace(/\s+time\s?zones?\b/gi, "")
    .split(/,|\s+-\s+/)
    .map((p) => p.trim())
    .filter((p, i, all) => p && !/^switzerland$/i.test(p) && all.indexOf(p) === i);
  return parts.join(", ") || null;
}

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const JOB_TYPE: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const WORKPLACE: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

// Role takes the slack; place, type and age are fixed columns from md up
const COLUMNS = "md:grid md:grid-cols-[minmax(0,1fr)_11rem_7.5rem_6.5rem] md:gap-x-6";

export function JobRow({ job }: { job: Job }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const place = shortLocation(job.location);
  // "Remote - Europe Timezone" already says it; don't repeat "Remote" under the type
  const workplace =
    place && /remote/i.test(place) && job.location_type === "remote"
      ? null
      : WORKPLACE[job.location_type];

  return (
    <li
      className={cn(
        "group relative -mx-3 border-b px-3 py-4 hover:bg-muted md:items-center",
        COLUMNS,
        // Featured: a red bar in the gutter, the only red in the list
        job.featured && "before:absolute before:inset-y-3 before:left-0 before:w-1 before:bg-brand"
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        <CompanyLogo
          name={job.company?.name}
          logoUrl={job.company?.logo_url}
          className="mt-0.5"
        />
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-snug">
            {/* Stretched link: the whole row is the click target */}
            <Link
              href={`/jobs/${job.slug}`}
              className="after:absolute after:inset-0 group-hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-foreground"
            >
              {job.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {job.company?.name}
            {job.featured && <span className="ml-3 font-medium text-brand">Featured</span>}
            {salary && <span className="ml-3 text-foreground">{salary}</span>}
          </p>
        </div>
      </div>

      {/* Mobile: one quiet line under the role. md+: three grid columns. */}
      <div className="mt-2 flex flex-wrap gap-x-4 pl-14 text-sm text-muted-foreground md:contents">
        <span className="md:text-[15px] md:text-foreground">{place ?? WORKPLACE[job.location_type]}</span>
        <span className="md:flex md:flex-col md:text-[15px]">
          <span className="md:text-foreground">{JOB_TYPE[job.job_type] ?? job.job_type}</span>
          {workplace && place && <span className="ml-4 md:ml-0">{workplace}</span>}
        </span>
        {job.published_at && (
          <span className="tabular md:text-right">{timeAgo(job.published_at)}</span>
        )}
      </div>
    </li>
  );
}

export function JobList({ jobs, header = true }: { jobs: Job[]; header?: boolean }) {
  return (
    <div>
      {header && (
        <div
          aria-hidden="true"
          className={cn(
            "-mx-3 hidden border-b border-foreground px-3 pb-2 text-[13px] font-medium text-muted-foreground",
            COLUMNS
          )}
        >
          <span className="pl-14">Role</span>
          <span>Place</span>
          <span>Type</span>
          <span className="text-right">Posted</span>
        </div>
      )}
      <ul className={cn(!header && "border-t")}>
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
      </ul>
    </div>
  );
}
