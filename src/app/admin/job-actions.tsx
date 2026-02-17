"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { updateJobStatus } from "./actions";
import type { JobStatus } from "@/types";

export function JobActions({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const [loading, setLoading] = useState(false);

  async function handleAction(newStatus: JobStatus) {
    setLoading(true);
    try {
      await updateJobStatus(jobId, newStatus);
    } catch {
      setLoading(false);
    }
  }

  if (status === "pending") {
    return (
      <div className="flex justify-end gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAction("active")}
          disabled={loading}
          className="gap-1 text-green-700 hover:text-green-800"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAction("rejected")}
          disabled={loading}
          className="gap-1 text-red-700 hover:text-red-800"
        >
          <X className="size-3" />
          Reject
        </Button>
      </div>
    );
  }

  if (status === "active") {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAction("expired")}
        disabled={loading}
        className="text-muted-foreground"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : "Expire"}
      </Button>
    );
  }

  return null;
}
