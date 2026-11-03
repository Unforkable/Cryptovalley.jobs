import { cn } from "@/lib/utils";

/** Red square with a white V: the valley. Same drawing as app/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-6 shrink-0", className)}>
      <rect width="64" height="64" fill="var(--brand)" />
      <path d="M14 18 L32 46 L50 18" fill="none" stroke="#fff" strokeWidth="9" strokeLinejoin="miter" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[17px] font-bold tracking-tight", className)}>
      <LogoMark />
      <span>
        CryptoValley<span className="font-normal text-muted-foreground">.jobs</span>
      </span>
    </span>
  );
}
