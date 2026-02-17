"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, X } from "lucide-react";
import { createJob } from "@/app/post-job/actions";
import type { Company } from "@/types";

export function PostJobForm({ companies }: { companies: Company[] }) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addTag(value: string) {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.set("tags", tags.join(","));
    try {
      const { checkoutUrl } = await createJob(formData);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Role Details */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Role Details</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Senior Solidity Developer"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Job Type *</Label>
            <Select name="job_type" required defaultValue="full-time">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location Type *</Label>
            <Select name="location_type" required defaultValue="hybrid">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Zug, Switzerland"
          />
        </div>
      </section>

      <Separator />

      {/* Company */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Company</h2>
        <div className="space-y-2">
          <Label>Company *</Label>
          <Select name="company_id" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      {/* Description */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <div className="space-y-2">
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the role, responsibilities, requirements, and benefits..."
            className="min-h-[200px]"
            required
          />
        </div>
      </section>

      <Separator />

      {/* Compensation */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Compensation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salary_min">Salary Min (CHF)</Label>
            <Input
              id="salary_min"
              name="salary_min"
              type="number"
              placeholder="e.g. 120000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary_max">Salary Max (CHF)</Label>
            <Input
              id="salary_max"
              name="salary_max"
              type="number"
              placeholder="e.g. 180000"
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Application */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Application</h2>
        <div className="space-y-2">
          <Label htmlFor="apply_url">Application URL *</Label>
          <Input
            id="apply_url"
            name="apply_url"
            type="url"
            placeholder="https://yourcompany.com/careers/role"
            required
          />
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tags</h2>
        <div className="space-y-2">
          <Label htmlFor="tag-input">
            Add tags (press Enter to add)
          </Label>
          <Input
            id="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="e.g. solidity, defi, typescript"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="size-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading && <Loader2 className="size-4 animate-spin" />}
        Proceed to Payment — CHF 299
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        You&apos;ll be redirected to Stripe to complete payment. Your listing will be reviewed after payment.
      </p>
    </form>
  );
}
