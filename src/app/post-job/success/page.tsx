import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Payment Successful",
};

export default async function PostJobSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let verified = false;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      verified = session.payment_status === "paid";
    } catch {
      // Invalid session_id — leave verified as false
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      {verified ? (
        <>
          <CheckCircle className="mx-auto size-12 text-green-500" />
          <h1 className="mt-4 text-3xl font-bold">Payment Successful!</h1>
          <p className="mt-2 text-muted-foreground">
            Your job listing is now under review. We&apos;ll activate it within 24
            hours.
          </p>
        </>
      ) : (
        <>
          <CheckCircle className="mx-auto size-12 text-yellow-500" />
          <h1 className="mt-4 text-3xl font-bold">Job Submitted</h1>
          <p className="mt-2 text-muted-foreground">
            If you completed payment, your listing is under review and will be
            activated within 24 hours.
          </p>
        </>
      )}
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
