import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createNewsletterClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Upgrade to your private server-side service role key to safely bypass RLS securely
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase newsletter environment variables.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
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

    // 1. Strict pattern validation
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const supabase = createNewsletterClient();
    
    // 2. Perform database transaction insert
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      source,
      status: "subscribed",
      referrer: request.headers.get("referer")?.slice(0, 500) || null,
      user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
    });

    // 3. Catch structural errors but mask duplicate registration warnings (23505)
    if (error && error.code !== "23505") {
      console.error("Newsletter DB Write Exception:", error);
      return NextResponse.json(
        { error: "Could not save your email yet." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter API Edge Failure:", err);
    return NextResponse.json(
      { error: "Could not save your email yet." },
      { status: 500 },
    );
  }
}
