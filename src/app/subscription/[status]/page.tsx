import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MailX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Job Alerts",
  robots: { index: false, follow: false },
};

const CONTENT = {
  confirmed: {
    icon: CheckCircle2,
    iconClass: "text-green-600",
    title: "Subscription confirmed!",
    body: "You'll get an email whenever new crypto jobs are posted in Switzerland's Crypto Valley.",
  },
  unsubscribed: {
    icon: MailX,
    iconClass: "text-muted-foreground",
    title: "You're unsubscribed",
    body: "You won't receive any more job alerts. You can re-subscribe anytime on the homepage.",
  },
  invalid: {
    icon: AlertCircle,
    iconClass: "text-amber-600",
    title: "Link not valid",
    body: "This link has expired or was already used. You can subscribe again below.",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(CONTENT).map((status) => ({ status }));
}

export default async function SubscriptionStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const content = CONTENT[status as keyof typeof CONTENT];
  if (!content) notFound();

  const Icon = content.icon;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <Icon className={`mx-auto size-12 ${content.iconClass}`} />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        {content.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{content.body}</p>
      <Button asChild className="mt-8 rounded-xl px-8">
        <Link href="/jobs">Browse Jobs</Link>
      </Button>
    </div>
  );
}
