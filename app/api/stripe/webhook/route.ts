import { recordCheckoutCompleted, verifyStripeWebhookEvent } from "@/lib/stripe";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    const event = await verifyStripeWebhookEvent(payload, signature);

    if (event.type === "checkout.session.completed") {
      await recordCheckoutCompleted(event.data.object);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
