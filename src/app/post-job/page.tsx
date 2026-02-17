import type { Metadata } from "next";
import { getAllCompanies } from "@/lib/supabase/queries";
import { PostJobForm } from "@/components/jobs/post-job-form";

export const metadata: Metadata = {
  title: "Post a Job",
  description:
    "Post your blockchain or crypto job listing to reach top talent in Crypto Valley.",
};

export default async function PostJobPage() {
  const companies = await getAllCompanies();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Post a Job</h1>
      <p className="mt-2 text-muted-foreground">
        Reach the best blockchain and crypto talent in Switzerland.
      </p>

      <div className="mt-8">
        <PostJobForm companies={companies} />
      </div>
    </div>
  );
}
