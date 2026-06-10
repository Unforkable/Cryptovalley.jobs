import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

// Unsubscribe is POST-only so link-prefetching email scanners can't
// accidentally trigger it. Mail providers use RFC 8058 one-click POST;
// humans go through the /subscription/unsubscribe confirmation page.
export async function POST(request: Request) {
  let token = new URL(request.url).searchParams.get("token");
  if (!token) {
    const form = await request.formData().catch(() => null);
    token = (form?.get("token") as string) ?? null;
  }

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/subscription/invalid`, 303);
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("email_subscriptions")
    .delete()
    .eq("confirmation_token", token)
    .select("id")
    .maybeSingle();

  return NextResponse.redirect(
    data
      ? `${BASE_URL}/subscription/unsubscribed`
      : `${BASE_URL}/subscription/invalid`,
    303
  );
}

// Old links or manual URL entry: send humans to the confirmation page.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  return NextResponse.redirect(
    token
      ? `${BASE_URL}/subscription/unsubscribe?token=${encodeURIComponent(token)}`
      : `${BASE_URL}/subscription/invalid`
  );
}
