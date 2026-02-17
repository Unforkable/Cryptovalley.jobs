import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const jobId = session.metadata?.job_id;

    if (!jobId) {
      console.error("Webhook: missing job_id in session metadata");
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("stripe_session_id", session.id);

    if (paymentError) {
      console.error("Webhook: failed to update payment:", paymentError.message);
      return NextResponse.json({ error: "Payment update failed" }, { status: 500 });
    }

    // Move job from draft to pending (awaiting admin review)
    const { error: jobError } = await supabase
      .from("jobs")
      .update({ status: "pending" })
      .eq("id", jobId)
      .eq("status", "draft");

    if (jobError) {
      console.error("Webhook: failed to update job:", jobError.message);
      return NextResponse.json({ error: "Job update failed" }, { status: 500 });
    }

    console.log(`Webhook: payment completed for job ${jobId}`);
  }

  return NextResponse.json({ received: true });
}
