"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function EmailSubscribeForm({
  className,
  stacked = false,
}: {
  className?: string;
  stacked?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSuccess(
        data.message || "You're subscribed! We'll notify you of new jobs."
      );
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={className}>
        <p className="text-sm font-medium text-green-600">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={stacked ? "flex w-full flex-col gap-2" : "flex gap-2"}>
        <Input
          type="email"
          placeholder="you@example.com"
          aria-label="Email address for job alerts"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={stacked ? "w-full" : "max-w-xs"}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Free job alerts. No spam, unsubscribe anytime.
      </p>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </form>
  );
}
