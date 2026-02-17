import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
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

  return getStripe().checkout.sessions.create({
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
