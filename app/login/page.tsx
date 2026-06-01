"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import "./auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/dashboard`
      : undefined;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "auth") {
      toast.error("Sign in could not be completed. Please try again.");
    }
  }, []);

  useEffect(() => {
    async function redirectSignedInUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    redirectSignedInUser();
  }, [router]);

  async function signIn() {
    const trimmed = email.trim();

    // Validate before hitting the API
    if (!trimmed) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("That doesn't look like a valid email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(`Login failed: ${error.message}`);
      return;
    }

    setEmailSent(true);
    toast.success("Check your email — your login link is on the way.");
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    // Only runs if redirect didn't happen (i.e. error)
    setGoogleLoading(false);

    if (error) {
      toast.error("Google sign in failed. Please try again.");
      return;
    }
  }

  if (checkingSession) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Checking your session...</h1>
        </div>
      </main>
    );
  }

  // After email is sent — show confirmation state
  if (emailSent) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-sent-icon">✉️</div>
          <h1>Check your inbox</h1>
          <p className="auth-sent-sub">
            We sent a login link to <strong>{email}</strong>.
            Click it to sign in — no password needed.
          </p>
          <p className="auth-sent-note">
            Wrong email?{" "}
            <button
              className="auth-link"
              onClick={() => setEmailSent(false)}
            >
              Go back
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-lamp">💡</span>
          <span className="auth-logo-text">Streetlight</span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to access your chapters and membership.</p>

        {/* Google */}
        <button
          onClick={signInWithGoogle}
          className="btn-ghost"
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <span className="auth-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Email magic link */}
        <div className="auth-field">
          <label htmlFor="email-input">Email address</label>
          <input
            id="email-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            disabled={loading}
            autoComplete="email"
            autoFocus
          />
        </div>

        <button
          onClick={signIn}
          className="btn-primary"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <>
              <span className="auth-spinner" />
              Sending…
            </>
          ) : (
            "Enter Streetlight"
          )}
        </button>

        <p className="auth-note">
          No password. We email you a magic link that signs you in instantly.
        </p>

      </div>
    </main>
  );
}
