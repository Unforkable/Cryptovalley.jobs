import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              CryptoValley<span className="text-muted-foreground">.jobs</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              The job board for blockchain and crypto companies in
              Switzerland&apos;s Crypto Valley.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h3 className="text-sm font-semibold">For Job Seekers</h3>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/jobs" className="hover:text-foreground">
                  Browse Jobs
                </Link>
                <Link href="/companies" className="hover:text-foreground">
                  Companies
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="text-sm font-semibold">For Employers</h3>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/post-job" className="hover:text-foreground">
                  Post a Job
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CryptoValley.jobs. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
