import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [jobsRes, companiesRes] = await Promise.all([
    supabase
      .from("jobs")
      .select("slug, published_at")
      .order("published_at", { ascending: false }),
    supabase
      .from("companies")
      .select("slug, created_at")
      .order("name"),
  ]);

  const jobs = jobsRes.data ?? [];
  const companies = companiesRes.data ?? [];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/companies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/post-job`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.slug}`,
    lastModified: job.published_at ? new Date(job.published_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${BASE_URL}/companies/${company.slug}`,
    lastModified: company.created_at ? new Date(company.created_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...jobPages, ...companyPages];
}
