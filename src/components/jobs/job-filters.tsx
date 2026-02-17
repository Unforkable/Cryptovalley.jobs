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
import { X } from "lucide-react";

export function JobFilters({
  jobType,
  locationType,
  tag,
}: {
  jobType?: string;
  locationType?: string;
  tag?: string;
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

  const hasFilters = jobType || locationType || tag;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={jobType ?? "all"}
        onValueChange={(v) => updateFilter("job_type", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[160px]">
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
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All locations</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="onsite">Onsite</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Search tags..."
        defaultValue={tag ?? ""}
        className="w-[180px]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const val = (e.target as HTMLInputElement).value.trim();
            updateFilter("tag", val || undefined);
          }
        }}
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/jobs")}
          className="gap-1 text-muted-foreground"
        >
          <X className="size-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
