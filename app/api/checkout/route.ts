import { createStripeCheckoutSession, getCheckoutProduct } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse, type NextRequest } from "next/server";

async function getProductFromRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as {
      product?: string;
    };

    return {
      product: getCheckoutProduct(body.product ?? ""),
      wantsJson: true,
    };
  }

  const formData = await request.formData();

  return {
    product: getCheckoutProduct(String(formData.get("product") ?? "")),
    wantsJson: false,
  };
}

export async function POST(request: NextRequest) {
  const { product, wantsJson } = await getProductFromRequest(request);

  if (!product) {
    return NextResponse.json({ error: "Invalid checkout product." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (wantsJson) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    if (wantsJson) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
