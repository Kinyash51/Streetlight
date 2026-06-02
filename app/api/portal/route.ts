import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/account");
    return NextResponse.redirect(loginUrl, 303);
  }

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .not("stripe_customer_id", "is", null)
    .limit(1);

  if (error) {
    const accountUrl = new URL("/account", request.url);
    accountUrl.searchParams.set("billing", "error");
    return NextResponse.redirect(accountUrl, 303);
  }

  const customerId = subscriptions?.[0]?.stripe_customer_id;

  if (!customerId) {
    const accountUrl = new URL("/account", request.url);
    accountUrl.searchParams.set("billing", "unavailable");
    return NextResponse.redirect(accountUrl, 303);
  }

  try {
    const portalUrl = await createBillingPortalSession({
      customerId,
      returnUrl: `${new URL(request.url).origin}/account`,
    });

    return NextResponse.redirect(portalUrl, 303);
  } catch {
    const accountUrl = new URL("/account", request.url);
    accountUrl.searchParams.set("billing", "error");
    return NextResponse.redirect(accountUrl, 303);
  }
}
