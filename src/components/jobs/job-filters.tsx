"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function JobFilters({
  jobType,
  locationType,
  q,
}: {
  jobType?: string;
  locationType?: string;
  q?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1 on filter change
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasFilters = jobType || locationType || q;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        role="search"
        className="relative w-full sm:w-[260px]"
        onSubmit={(e) => {
          e.preventDefault();
          const val = new FormData(e.currentTarget).get("q")?.toString().trim();
          updateFilter("q", val || undefined);
        }}
      >
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          key={q ?? ""}
          name="q"
          type="search"
          placeholder="Role, company or city"
          aria-label="Search jobs"
          defaultValue={q ?? ""}
          className="h-10 pl-8"
        />
      </form>

      <Select
        value={jobType ?? "all"}
        onValueChange={(v) => updateFilter("job_type", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[160px]" aria-label="Job type">
          <SelectValue placeholder="Job type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="full-time">Full-time</SelectItem>
          <SelectItem value="part-time">Part-time</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={locationType ?? "all"}
        onValueChange={(v) =>
          updateFilter("location_type", v === "all" ? undefined : v)
        }
      >
        <SelectTrigger className="w-[160px]" aria-label="Workplace">
          <SelectValue placeholder="Workplace" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any workplace</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="onsite">On-site</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/jobs")}
          className="gap-1 text-muted-foreground"
        >
          <X className="size-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
