import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, confirmationEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("email_subscriptions")
    .select("id, confirmed, confirmation_token")
    .eq("email", email)
    .maybeSingle();

  if (existing?.confirmed) {
    return NextResponse.json({
      success: true,
      message: "You're already subscribed.",
    });
  }

  // Until an email provider is configured, fall back to single opt-in.
  const doubleOptIn = isEmailConfigured();

  let token = existing?.confirmation_token;
  if (!existing) {
    const { data, error } = await supabase
      .from("email_subscriptions")
      .insert({ email, confirmed: !doubleOptIn })
      .select("confirmation_token")
      .single();
    if (error) {
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }
    token = data.confirmation_token;
  } else if (!doubleOptIn) {
    await supabase
      .from("email_subscriptions")
      .update({ confirmed: true })
      .eq("id", existing.id);
  }

  if (!doubleOptIn) {
    return NextResponse.json({
      success: true,
      message: "You're subscribed! We'll notify you of new jobs.",
    });
  }

  const sent = await sendEmail({ to: email, ...confirmationEmail(token) });
  if (!sent) {
    return NextResponse.json(
      { error: "Could not send confirmation email. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Almost there — check your inbox to confirm your subscription.",
  });
}
