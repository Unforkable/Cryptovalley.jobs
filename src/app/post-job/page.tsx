import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getAllCompanies } from "@/lib/supabase/queries";
import { PostJobForm } from "@/components/jobs/post-job-form";

export const metadata: Metadata = {
  title: "Post a Job",
  description:
    "Post your blockchain or crypto job listing to reach top talent in Crypto Valley.",
};

const benefits = [
  "Live for 30 days",
  "Seen by crypto talent across Switzerland",
  "Sent to our job alert subscribers",
];

export default async function PostJobPage() {
  const companies = await getAllCompanies();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Post a Job</h1>
      <p className="mt-2 text-muted-foreground">
        Reach the best blockchain and crypto talent in Switzerland.
      </p>

      <div className="mt-6 rounded-xl border bg-muted/40 p-4">
        <p className="font-semibold">
          CHF 299 <span className="font-normal text-muted-foreground">per posting — one-time, no subscription</span>
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <Check className="size-4 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <PostJobForm companies={companies} />
      </div>
    </div>
  );
}
