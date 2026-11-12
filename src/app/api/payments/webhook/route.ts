/**
 * PAYMENT WEBHOOK — placeholder, intentionally NOT implemented.
 *
 * When you choose a payment provider (e.g. PayMongo, Xendit, Stripe):
 *   1. Store its secret keys in environment variables (never in code).
 *   2. Verify the webhook signature here using the provider's official method.
 *   3. Only for a verified, successful payment: create an access token with
 *      createAccessToken() from "@/lib/access" and deliver it to the buyer.
 *
 * Until then this endpoint refuses every request, so no payment can ever be
 * marked as complete by mistake.
 */
export async function POST() {
  return Response.json(
    { error: "Payments are not configured yet." },
    { status: 501 },
  );
}
