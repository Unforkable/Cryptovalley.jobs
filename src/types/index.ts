export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type JobLocation = "remote" | "onsite" | "hybrid";
export type JobStatus = "draft" | "pending" | "active" | "expired" | "rejected";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  location: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  description: string;
  job_type: JobType;
  location_type: JobLocation;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  apply_url: string;
  tags: string[];
  status: JobStatus;
  featured: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  // Joined
  company?: Company;
}

export interface EmailSubscription {
  id: string;
  email: string;
  tags: string[];
  job_types: JobType[];
  location_types: JobLocation[];
  confirmed: boolean;
  created_at: string;
}
