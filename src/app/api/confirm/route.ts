import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/subscription/invalid`);
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("email_subscriptions")
    .update({ confirmed: true })
    .eq("confirmation_token", token)
    .select("id")
    .maybeSingle();

  return NextResponse.redirect(
    data
      ? `${BASE_URL}/subscription/confirmed`
      : `${BASE_URL}/subscription/invalid`
  );
}
