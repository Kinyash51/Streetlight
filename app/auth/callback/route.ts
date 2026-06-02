import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") ?? "/welcome";
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const redirectUrl = new URL(safeNext, requestUrl.origin);

  let response = NextResponse.redirect(redirectUrl);

  if (authError) {
    return NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin));
  }

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });

            Object.entries(headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      response = NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin));
    }
  }

  return response;
}
