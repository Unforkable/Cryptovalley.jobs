import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Company logo with initials underneath.
 *
 * A plain <img> instead of AvatarImage: Radix only mounts AvatarImage after
 * hydration and a client-side load, so every page first flashed initials.
 * Rendered here, the logo is in the server HTML. logo_url is only set for
 * favicons verified to exist, so the initials rarely show.
 */
export function CompanyLogo({
  name,
  logoUrl,
  size = "lg",
  className,
  fallbackClassName,
}: {
  name?: string | null;
  logoUrl?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackClassName?: string;
}) {
  const initials = name?.slice(0, 2).toUpperCase() ?? "??";
  return (
    <Avatar size={size} className={cn("rounded-sm", className)}>
      <AvatarFallback className={cn("rounded-sm", fallbackClassName)}>{initials}</AvatarFallback>
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- tiny remote favicon, next/image adds nothing
        <img
          src={logoUrl}
          alt=""
          decoding="async"
          className="absolute inset-0 size-full bg-background object-contain"
        />
      )}
    </Avatar>
  );
}
