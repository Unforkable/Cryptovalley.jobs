import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminJobs, getAdminStats } from "@/lib/supabase/queries";
import type { JobStatus } from "@/types";
import { JobActions } from "./job-actions";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const statusColors: Record<JobStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  active: "bg-green-500/15 text-green-700 border-green-200",
  expired: "bg-gray-500/15 text-gray-700 border-gray-200",
  rejected: "bg-red-500/15 text-red-700 border-red-200",
  draft: "bg-blue-500/15 text-blue-700 border-blue-200",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = status as JobStatus | undefined;

  const [stats, jobs] = await Promise.all([
    getAdminStats(),
    getAdminJobs(statusFilter),
  ]);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.companies}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter links */}
      <div className="mt-8 flex gap-2">
        {[
          { label: "All", value: undefined },
          { label: "Pending", value: "pending" },
          { label: "Active", value: "active" },
          { label: "Expired", value: "expired" },
          { label: "Rejected", value: "rejected" },
        ].map((filter) => (
          <Link
            key={filter.label}
            href={
              filter.value ? `/admin?status=${filter.value}` : "/admin"
            }
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === filter.value ||
              (!statusFilter && !filter.value)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Jobs table */}
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="hover:underline"
                    >
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell>{job.company?.name ?? "—"}</TableCell>
                  <TableCell>{job.job_type}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(job.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <JobActions jobId={job.id} status={job.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
