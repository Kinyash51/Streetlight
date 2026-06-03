import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createNewsletterClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase newsletter environment variables.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown;
      source?: unknown;
    } | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source =
      typeof body?.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 80)
        : "homepage";

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const supabase = createNewsletterClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      source,
      status: "subscribed",
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
    });

    if (error && error.code !== "23505") {
      return NextResponse.json(
        { error: "Could not save your email yet." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not save your email yet." },
      { status: 500 },
    );
  }
}
