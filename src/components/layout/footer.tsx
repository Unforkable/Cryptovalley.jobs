import Link from "next/link";
import { Wordmark } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <Link href="/" aria-label="CryptoValley.jobs home">
            <Wordmark />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Crypto and blockchain jobs in Switzerland, checked against company
            career pages every morning.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm sm:col-span-3">
          <Link href="/jobs" className="hover:underline">All jobs</Link>
          <Link href="/companies" className="hover:underline">Companies</Link>
        </nav>
        <nav aria-label="For employers" className="flex flex-col gap-2 text-sm sm:col-span-3">
          <Link href="/post-job" className="hover:underline">Post a job</Link>
          <span className="text-muted-foreground">&copy; {new Date().getFullYear()} CryptoValley.jobs</span>
        </nav>
      </div>
    </footer>
  );
}
