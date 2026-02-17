"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createCheckoutSession } from "@/lib/stripe";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function createJob(formData: FormData): Promise<{ checkoutUrl: string }> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const job_type = formData.get("job_type") as string;
  const location_type = formData.get("location_type") as string;
  const location = (formData.get("location") as string) || null;
  const apply_url = formData.get("apply_url") as string;
  const salary_min = formData.get("salary_min")
    ? Number(formData.get("salary_min"))
    : null;
  const salary_max = formData.get("salary_max")
    ? Number(formData.get("salary_max"))
    : null;
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const company_mode = formData.get("company_mode") as string;

  const supabase = createServiceClient();

  let company_id: string;

  if (company_mode === "new") {
    const company_name = formData.get("company_name") as string;
    const company_website = (formData.get("company_website") as string) || null;
    const company_location = (formData.get("company_location") as string) || null;

    if (!company_name) throw new Error("Company name is required");

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: company_name,
        slug: slugify(company_name),
        website: company_website,
        location: company_location,
      })
      .select("id")
      .single();

    if (companyError || !company) throw new Error(companyError?.message || "Failed to create company");
    company_id = company.id;
  } else {
    company_id = formData.get("company_id") as string;
  }

  if (!title || !description || !job_type || !location_type || !company_id || !apply_url) {
    throw new Error("Missing required fields");
  }

  // 1. Insert job as draft (not visible until payment completes)
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      title,
      slug: slugify(title),
      description,
      job_type,
      location_type,
      location,
      company_id,
      apply_url,
      salary_min,
      salary_max,
      salary_currency: "CHF",
      tags,
      status: "draft",
    })
    .select("id")
    .single();

  if (jobError || !job) throw new Error(jobError?.message || "Failed to create job");

  // 2. Create Stripe checkout session with job_id in metadata
  const session = await createCheckoutSession({
    jobId: job.id,
    jobTitle: title,
  });

  // 3. Create payment record linked to the session
  const { error: paymentError } = await supabase.from("payments").insert({
    job_id: job.id,
    stripe_session_id: session.id,
    amount: 29900,
    currency: "chf",
    status: "pending",
  });

  if (paymentError) throw new Error(paymentError.message);

  revalidatePath("/admin");

  return { checkoutUrl: session.url! };
}
