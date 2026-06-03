"use client";

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

function LoginShell() {
  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Loading Streetlight...</h1>
          <p>Preparing your sign in page.</p>
        </div>
      </div>
    </main>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const nextPath =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`
      : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callbackUrl,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage("Check your email for the confirmation link.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.push(nextPath);
        router.refresh();
      }
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setLoading(true);
    setError("");

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{mode === "signin" ? "Welcome back" : "Join the street"}</h1>
          <p>
            {mode === "signin"
              ? "Sign in to continue reading."
              : "Create an account to start your journey."}
          </p>
        </div>

        {error ? (
          <div className="login-error">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="login-success">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {message}
          </div>
        ) : null}

        <div className="login-oauth">
          <button
            type="button"
            className="login-oauth-btn google"
            onClick={() => handleOAuth("google")}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="login-oauth-btn github"
            onClick={() => handleOAuth("github")}
            disabled={loading}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="login-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-loading">
                <svg
                  className="spinner"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="60"
                    strokeDashoffset="20"
                  />
                </svg>
                {mode === "signin" ? "Signing in..." : "Creating account..."}
              </span>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="login-toggle">
          {mode === "signin" ? (
            <p>
              No account?{" "}
              <button
                type="button"
                className="login-toggle-btn"
                onClick={() => setMode("signup")}
              >
                Join the street
              </button>
            </p>
          ) : (
            <p>
              Already here?{" "}
              <button
                type="button"
                className="login-toggle-btn"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <div className="login-footer">
          <p>Chapter One is free. No account needed to read.</p>
          <Link href="/read/chapter-one">Read Chapter One</Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}
