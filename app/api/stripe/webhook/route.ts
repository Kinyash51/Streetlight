import {
  recordCheckoutCompleted,
  recordInvoicePaid,
  recordInvoicePaymentFailed,
  recordSubscriptionDeleted,
  recordSubscriptionUpdated,
  verifyStripeWebhookEvent,
  type StripeCheckoutCompletedSession,
  type StripeInvoiceObject,
  type StripeSubscriptionObject,
} from "@/lib/stripe";
import { handleWebhookEmail } from "@/lib/webhook-emails";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    const event = await verifyStripeWebhookEvent(payload, signature);

    switch (event.type) {
      case "checkout.session.completed":
        await recordCheckoutCompleted(
          event.data.object as StripeCheckoutCompletedSession
        );
        break;
      case "invoice.paid":
        await recordInvoicePaid(event.data.object as StripeInvoiceObject);
        break;
      case "invoice.payment_failed":
        await recordInvoicePaymentFailed(
          event.data.object as StripeInvoiceObject
        );
        break;
      case "customer.subscription.updated":
        await recordSubscriptionUpdated(
          event.data.object as StripeSubscriptionObject
        );
        break;
      case "customer.subscription.deleted":
        await recordSubscriptionDeleted(
          event.data.object as StripeSubscriptionObject
        );
        break;
      default:
        break;
    }

    await handleWebhookEmail(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
