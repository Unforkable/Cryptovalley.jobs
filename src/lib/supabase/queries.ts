import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Job, Company, JobType, JobLocation, JobStatus } from "@/types";

export interface CompanyWithJobCount extends Company {
  job_count: number;
}

// PostgREST filter: job has no expiry date or it hasn't passed yet
function notExpiredFilter() {
  return `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`;
}

// ─── Public queries (anon client, respects RLS) ─────────────────────

export async function getLatestJobs(limit = 6): Promise<Job[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("status", "active")
    .or(notExpiredFilter())
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data as Job[]) ?? [];
}

const JOBS_PER_PAGE = 10;

export async function getActiveJobs(filters?: {
  job_type?: JobType;
  location_type?: JobLocation;
  tag?: string;
  page?: number;
}): Promise<{ jobs: Job[]; total: number; totalPages: number }> {
  const supabase = await createClient();
  const page = Math.max(1, filters?.page ?? 1);
  const from = (page - 1) * JOBS_PER_PAGE;
  const to = from + JOBS_PER_PAGE - 1;

  let query = supabase
    .from("jobs")
    .select("*, company:companies(*)", { count: "exact" })
    .eq("status", "active")
    .or(notExpiredFilter())
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (filters?.job_type) {
    query = query.eq("job_type", filters.job_type);
  }
  if (filters?.location_type) {
    query = query.eq("location_type", filters.location_type);
  }
  if (filters?.tag) {
    query = query.contains("tags", [filters.tag]);
  }

  const { data, count } = await query;
  const total = count ?? 0;
  return {
    jobs: (data as Job[]) ?? [],
    total,
    totalPages: Math.ceil(total / JOBS_PER_PAGE),
  };
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("slug", slug)
    .single();
  return (data as Job) ?? null;
}

export async function getAllCompanies(): Promise<CompanyWithJobCount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*, jobs(count)")
    .eq("jobs.status", "active")
    .or(notExpiredFilter(), { referencedTable: "jobs" })
    .order("name");
  const companies = (data as (Company & { jobs: { count: number }[] })[]) ?? [];
  return companies.map(({ jobs, ...company }) => ({
    ...company,
    job_count: jobs?.[0]?.count ?? 0,
  }));
}

export async function getCompanyBySlug(
  slug: string
): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();
  return (data as Company) ?? null;
}

export async function getJobsByCompany(companyId: string): Promise<Job[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("company_id", companyId)
    .eq("status", "active")
    .or(notExpiredFilter())
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });
  return (data as Job[]) ?? [];
}

export async function getPublicStats(): Promise<{
  jobs: number;
  companies: number;
}> {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("jobs")
    .select("company_id", { count: "exact" })
    .eq("status", "active")
    .or(notExpiredFilter());
  const hiringCompanies = new Set(
    (data ?? []).map((row) => row.company_id)
  ).size;
  return {
    jobs: count ?? 0,
    companies: hiringCompanies,
  };
}

// ─── Admin queries (service client, bypasses RLS) ───────────────────

export async function getAdminJobs(
  statusFilter?: JobStatus
): Promise<Job[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;
  return (data as Job[]) ?? [];
}

export async function getAdminStats(): Promise<{
  pending: number;
  active: number;
  total: number;
  companies: number;
}> {
  const supabase = createServiceClient();

  const [jobsRes, companiesRes] = await Promise.all([
    supabase.from("jobs").select("status"),
    supabase.from("companies").select("id", { count: "exact", head: true }),
  ]);

  const jobs = jobsRes.data ?? [];
  const pending = jobs.filter((j) => j.status === "pending").length;
  const active = jobs.filter((j) => j.status === "active").length;

  return {
    pending,
    active,
    total: jobs.length,
    companies: companiesRes.count ?? 0,
  };
}
