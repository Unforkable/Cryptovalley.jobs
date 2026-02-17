import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const POSTING_PRICE_CHF = 29900; // CHF 299 in cents

export async function createCheckoutSession({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "chf",
          unit_amount: POSTING_PRICE_CHF,
          product_data: {
            name: "Job Posting — CryptoValley.jobs",
            description: jobTitle,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      job_id: jobId,
    },
    success_url: `${appUrl}/post-job/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/post-job`,
  });
}
