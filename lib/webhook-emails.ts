import { sendEmail } from "@/lib/email";
import {
  cancellationEmail,
  paymentFailedEmail,
  renewalEmail,
  welcomeEmail,
} from "@/lib/email-templates";
import { pricing } from "@/lib/pricing";
import {
  createSupabaseAdminClient,
  getCheckoutProduct,
  type StripeCheckoutCompletedSession,
  type StripeInvoiceObject,
  type StripeSubscriptionObject,
} from "@/lib/stripe";

type WebhookEmailEvent = {
  type: string;
  data: {
    object:
      | StripeCheckoutCompletedSession
      | StripeInvoiceObject
      | StripeSubscriptionObject;
  };
};

type ProfileEmail = {
  email: string | null;
  username: string | null;
};

async function getProfile(userId: string): Promise<ProfileEmail | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("email, username")
    .eq("id", userId)
    .maybeSingle();

  return (data as ProfileEmail | null) ?? null;
}

async function getProfileByCustomer(customerId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  const userId = subscription?.user_id as string | undefined;

  if (!userId) {
    return null;
  }

  return getProfile(userId);
}

function titleCaseTier(product: string | null | undefined) {
  if (product === pricing.patron.checkoutProduct) {
    return pricing.patron.name;
  }

  if (product === pricing.supporter.checkoutProduct) {
    return pricing.supporter.name;
  }

  return pricing.freeReader.name;
}

function getInvoiceCustomer(invoice: StripeInvoiceObject) {
  return typeof invoice.customer === "string" ? invoice.customer : null;
}

export async function handleWebhookEmail(event: WebhookEmailEvent) {
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as StripeCheckoutCompletedSession;
      const userId = session.metadata?.user_id ?? session.client_reference_id;
      const product = getCheckoutProduct(session.metadata?.product ?? null);

      if (!userId || !product || product === pricing.ebook.checkoutProduct) {
        return;
      }

      const profile = await getProfile(userId);

      if (!profile?.email) {
        return;
      }

      await sendEmail({
        to: profile.email,
        subject: "You're in the light.",
        html: welcomeEmail({
          name: profile.username,
          tier: titleCaseTier(product),
        }),
      });
      return;
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as StripeInvoiceObject;

      if (invoice.billing_reason !== "subscription_cycle") {
        return;
      }

      const customerId = getInvoiceCustomer(invoice);

      if (!customerId) {
        return;
      }

      const profile = await getProfileByCustomer(customerId);

      if (!profile?.email) {
        return;
      }

      await sendEmail({
        to: profile.email,
        subject: "Streetlight stays alive because of you.",
        html: renewalEmail({ name: profile.username }),
      });
      return;
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as StripeInvoiceObject;
      const customerId = getInvoiceCustomer(invoice);

      if (!customerId) {
        return;
      }

      const profile = await getProfileByCustomer(customerId);

      if (!profile?.email) {
        return;
      }

      await sendEmail({
        to: profile.email,
        subject: "Your Streetlight payment needs attention.",
        html: paymentFailedEmail({ name: profile.username }),
      });
      return;
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as StripeSubscriptionObject;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;

      if (!customerId) {
        return;
      }

      const profile = await getProfileByCustomer(customerId);

      if (!profile?.email) {
        return;
      }

      await sendEmail({
        to: profile.email,
        subject: "The Streetlight door stays open.",
        html: cancellationEmail({ name: profile.username }),
      });
    }
  } catch (error) {
    console.error("Webhook email failed:", error);
  }
}
