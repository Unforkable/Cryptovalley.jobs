"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import type { JobStatus } from "@/types";

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = { status };
  if (status === "active") {
    updateData.published_at = new Date().toISOString();
    // Set expiry 30 days from now
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    updateData.expires_at = expires.toISOString();
  }

  const { error } = await supabase
    .from("jobs")
    .update(updateData)
    .eq("id", jobId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/jobs");
  revalidatePath("/");
}
