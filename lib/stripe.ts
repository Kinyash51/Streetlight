import { createClient } from "@supabase/supabase-js";
import { pricing, type CheckoutProduct } from "@/lib/pricing";

type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

export type StripeCheckoutCompletedSession = {
  id: string;
  mode?: "payment" | "subscription";
  client_reference_id?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer?: string | null;
  customer_email?: string | null;
  payment_intent?: string | null;
  subscription?: string | null;
  metadata?: {
    product?: CheckoutProduct;
    user_id?: string;
  } | null;
};

export type StripeSubscriptionObject = {
  id: string;
  customer?: string | null;
  status?: string | null;
  metadata?: {
    product?: CheckoutProduct;
    tier?: CheckoutProduct;
    user_id?: string;
  } | null;
};

export type StripeInvoiceObject = {
  customer?: string | { id?: string | null } | null;
  billing_reason?: string | null;
  subscription?: string | { id?: string | null } | null;
  parent?: {
    subscription_details?: {
      subscription?: string | { id?: string | null } | null;
    } | null;
  } | null;
};

type StripeEvent = {
  type: string;
  data: {
    object:
      | StripeCheckoutCompletedSession
      | StripeSubscriptionObject
      | StripeInvoiceObject;
  };
};

const stripeApiVersion = "2025-02-24.acacia";

export function getCheckoutProduct(product: string | null): CheckoutProduct | null {
  if (
    product === pricing.ebook.checkoutProduct ||
    product === pricing.supporter.checkoutProduct ||
    product === pricing.patron.checkoutProduct
  ) {
    return product;
  }

  return null;
}

export function getProductConfig(product: CheckoutProduct) {
  if (product === pricing.ebook.checkoutProduct) {
    return {
      name: pricing.ebook.name,
      amount: pricing.ebook.amount,
      mode: "payment" as const,
      metadataProduct: pricing.ebook.checkoutProduct,
    };
  }

  if (product === pricing.supporter.checkoutProduct) {
    return {
      name: pricing.supporter.name,
      amount: pricing.supporter.amount,
      mode: "subscription" as const,
      metadataProduct: pricing.supporter.checkoutProduct,
    };
  }

  return {
    name: pricing.patron.name,
    amount: pricing.patron.amount,
    mode: "subscription" as const,
    metadataProduct: pricing.patron.checkoutProduct,
  };
}

export async function createStripeCheckoutSession({
  product,
  userId,
  email,
  origin,
}: {
  product: CheckoutProduct;
  userId: string;
  email?: string | null;
  origin: string;
}) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  const productConfig = getProductConfig(product);
  const params = new URLSearchParams({
    mode: productConfig.mode,
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    client_reference_id: userId,
    "metadata[user_id]": userId,
    "metadata[product]": productConfig.metadataProduct,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": productConfig.name,
    "line_items[0][price_data][unit_amount]": String(productConfig.amount),
  });

  if (email) {
    params.set("customer_email", email);
  }

  if (productConfig.mode === "subscription") {
    params.set("line_items[0][price_data][recurring][interval]", "month");
    params.set("subscription_data[metadata][product]", productConfig.metadataProduct);
    params.set("subscription_data[metadata][user_id]", userId);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": stripeApiVersion,
    },
    body: params,
  });

  const data = (await response.json()) as StripeCheckoutSession & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to create Stripe checkout session.");
  }

  return data;
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  const params = new URLSearchParams({
    customer: customerId,
    return_url: returnUrl,
  });

  const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": stripeApiVersion,
    },
    body: params,
  });

  const data = (await response.json()) as {
    url?: string | null;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to create billing portal session.");
  }

  if (!data.url) {
    throw new Error("Stripe did not return a billing portal URL.");
  }

  return data.url;
}

export async function verifyStripeWebhookEvent(
  payload: string,
  signatureHeader: string | null
): Promise<StripeEvent> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  if (!signatureHeader) {
    throw new Error("Missing Stripe signature.");
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    throw new Error("Invalid Stripe signature.");
  }

  const crypto = await import("node:crypto");
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new Error("Invalid Stripe signature.");
  }

  return JSON.parse(payload) as StripeEvent;
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getStripeObjectId(value: StripeInvoiceObject["subscription"]): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id ?? null;
}

function getInvoiceSubscriptionId(invoice: StripeInvoiceObject) {
  return (
    getStripeObjectId(invoice.subscription) ??
    getStripeObjectId(invoice.parent?.subscription_details?.subscription ?? null)
  );
}

async function retrieveStripeSubscription(subscriptionId: string) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  const response = await fetch(
    `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Stripe-Version": stripeApiVersion,
      },
    }
  );

  const data = (await response.json()) as StripeSubscriptionObject & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to retrieve Stripe subscription.");
  }

  return data;
}

export async function recordInvoicePaid(invoice: StripeInvoiceObject) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return;
  }

  const subscription = await retrieveStripeSubscription(subscriptionId);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status ?? "active",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordInvoicePaymentFailed(invoice: StripeInvoiceObject) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordSubscriptionUpdated(subscription: StripeSubscriptionObject) {
  const product = getCheckoutProduct(
    subscription.metadata?.product ?? subscription.metadata?.tier ?? null
  );
  const supabase = createSupabaseAdminClient();
  const updates: Record<string, string | null> = {
    status: subscription.status ?? "active",
    stripe_customer_id: subscription.customer ?? null,
    updated_at: new Date().toISOString(),
  };

  if (product) {
    updates.tier = product;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordSubscriptionDeleted(subscription: StripeSubscriptionObject) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordCheckoutCompleted(session: StripeCheckoutCompletedSession) {
  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const product = getCheckoutProduct(session.metadata?.product ?? null);

  if (!userId || !product) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  if (product === pricing.ebook.checkoutProduct) {
    const { error } = await supabase.from("orders").upsert(
      {
        user_id: userId,
        product,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
        status: "paid",
      },
      { onConflict: "stripe_checkout_session_id" }
    );

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  if (!session.subscription) {
    throw new Error("Missing Stripe subscription id.");
  }

  const subscription = await retrieveStripeSubscription(session.subscription);
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      tier: product,
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer ?? subscription.customer ?? null,
      status: subscription.status ?? "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
