"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

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

export async function createJob(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const job_type = formData.get("job_type") as string;
  const location_type = formData.get("location_type") as string;
  const location = (formData.get("location") as string) || null;
  const company_id = formData.get("company_id") as string;
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

  if (!title || !description || !job_type || !location_type || !company_id || !apply_url) {
    throw new Error("Missing required fields");
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("jobs").insert({
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
    status: "pending",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  redirect("/post-job/success");
}
