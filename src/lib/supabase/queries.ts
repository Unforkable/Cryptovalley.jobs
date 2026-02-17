import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Job, Company, JobType, JobLocation, JobStatus } from "@/types";

// ─── Public queries (anon client, respects RLS) ─────────────────────

export async function getLatestJobs(limit = 6): Promise<Job[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
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

export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("name");
  return (data as Company[]) ?? [];
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
    .order("published_at", { ascending: false });
  return (data as Job[]) ?? [];
}

export async function getPublicStats(): Promise<{
  jobs: number;
  companies: number;
}> {
  const supabase = await createClient();
  const [jobsRes, companiesRes] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
  ]);
  return {
    jobs: jobsRes.count ?? 0,
    companies: companiesRes.count ?? 0,
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
