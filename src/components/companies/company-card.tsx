import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Company } from "@/types";

export function CompanyCard({ company }: { company: Company }) {
  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className="h-full rounded-xl py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="flex flex-col items-center text-center">
          <Avatar size="lg" className="mb-3">
            {company.logo_url && (
              <AvatarImage src={company.logo_url} alt={company.name} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">{company.name}</h3>
          {company.location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3" />
              {company.location}
            </p>
          )}
          {company.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {company.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
