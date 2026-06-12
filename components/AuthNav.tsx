"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("tier, status")
          .eq("user_id", user.id)
          .in("status", ["active", "trialing"])
          .maybeSingle();

        if (sub?.status === "active" || sub?.status === "trialing") {
          setTier(sub.tier);
        }
      }

      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setTier(null);
        setDropdownOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setTier(null);
    setDropdownOpen(false);
    window.location.href = "/";
  }

  if (loading) {
    return <div className="auth-nav-skeleton" />;
  }

  if (!user) {
    return (
      <Link href="/login" className="auth-nav-signin">
        Sign In
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.username || user.email?.split("@")[0] || "Reader";
  const initials = displayName.slice(0, 2).toUpperCase();

  const tierBadge =
    tier === "patron" ? "patron" : tier === "supporter" ? "supporter" : null;

  return (
    <div className="auth-nav">
      <button
        type="button"
        className="auth-nav-trigger"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="auth-nav-avatar">{initials}</span>
        {tierBadge ? (
          <span className={`auth-nav-badge ${tierBadge}`}>{tierBadge}</span>
        ) : null}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`auth-nav-chevron ${dropdownOpen ? "open" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {dropdownOpen ? (
        <div className="auth-nav-dropdown">
          <div className="auth-nav-dropdown-header">
            <span className="auth-nav-dropdown-name">{displayName}</span>
            <span className="auth-nav-dropdown-email">{user.email}</span>
          </div>

          <div className="auth-nav-dropdown-divider" />

          <Link
            href="/dashboard"
            className="auth-nav-dropdown-item"
            onClick={() => setDropdownOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/account"
            className="auth-nav-dropdown-item"
            onClick={() => setDropdownOpen(false)}
          >
            Account
          </Link>

          <div className="auth-nav-dropdown-divider" />

          <button
            type="button"
            className="auth-nav-dropdown-item signout"
            onClick={handleSignOut}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
