import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Job Submitted",
};

export default function PostJobSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <CheckCircle className="mx-auto size-12 text-green-500" />
      <h1 className="mt-4 text-3xl font-bold">Job Submitted!</h1>
      <p className="mt-2 text-muted-foreground">
        Your listing is under review. We&apos;ll activate it within 24 hours.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/post-job">Post Another</Link>
        </Button>
      </div>
    </div>
  );
}
