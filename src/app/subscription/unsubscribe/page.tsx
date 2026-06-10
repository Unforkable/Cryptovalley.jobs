import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">
        Unsubscribe from job alerts?
      </h1>
      <p className="mt-3 text-muted-foreground">
        You&apos;ll stop receiving emails about new crypto jobs in Switzerland.
      </p>
      <form method="POST" action="/api/unsubscribe" className="mt-8">
        <input type="hidden" name="token" value={token ?? ""} />
        <Button type="submit" variant="destructive" className="rounded-xl px-8">
          Unsubscribe
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Changed your mind?{" "}
        <Link href="/jobs" className="text-primary hover:underline">
          Browse the latest jobs
        </Link>
      </p>
    </div>
  );
}
