import { createStripeCheckoutSession, getCheckoutProduct } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const product = getCheckoutProduct(String(formData.get("product") ?? ""));

  if (!product) {
    return NextResponse.json({ error: "Invalid checkout product." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/checkout");
    return NextResponse.redirect(loginUrl, 303);
  }

  try {
    const session = await createStripeCheckoutSession({
      product,
      userId: user.id,
      email: user.email,
      origin: new URL(request.url).origin,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 }
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
