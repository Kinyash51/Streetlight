"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

type AuthNavProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function AuthNav({
  variant = "desktop",
  onNavigate,
}: AuthNavProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const authNavRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!dropdownOpen) {
      return;
    }

    function closeDropdown(event: MouseEvent) {
      if (
        authNavRef.current &&
        !authNavRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDropdown);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [dropdownOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setTier(null);
    setDropdownOpen(false);
    window.location.href = "/";
  }

  if (loading) {
    return <div className={`auth-nav-skeleton auth-nav-${variant}`} />;
  }

  if (!user) {
    if (variant === "mobile") {
      return (
        <div className="mobile-account-card">
          <div>
            <strong>Your reader account</strong>
            <span>Save progress, apply for beta, and manage access.</span>
          </div>
          <Link href="/login" className="btn-primary" onClick={onNavigate}>
            Sign in
          </Link>
        </div>
      );
    }

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

  if (variant === "mobile") {
    return (
      <div className="mobile-account-card signed-in">
        <div className="mobile-account-identity">
          <span className="auth-nav-avatar">{initials}</span>
          <span>
            <strong>{displayName}</strong>
            <small>{user.email}</small>
          </span>
        </div>
        <div className="mobile-account-actions">
          <Link href="/dashboard" onClick={onNavigate}>
            Dashboard
          </Link>
          <Link href="/account" onClick={onNavigate}>
            Account
          </Link>
          <button type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-nav" ref={authNavRef}>
      <button
        type="button"
        className="auth-nav-trigger"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="auth-nav-avatar">{initials}</span>
        <span className="auth-nav-trigger-copy">
          <strong>{displayName}</strong>
          <small>{tierBadge ?? "Reader"}</small>
        </span>
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
        <div className="auth-nav-dropdown" role="menu">
          <div className="auth-nav-dropdown-header">
            <span className="auth-nav-avatar auth-nav-avatar-large">{initials}</span>
            <span>
              <span className="auth-nav-dropdown-name">{displayName}</span>
              <span className="auth-nav-dropdown-email">{user.email}</span>
            </span>
            {tierBadge ? (
              <span className={`auth-nav-badge ${tierBadge}`}>{tierBadge}</span>
            ) : null}
          </div>

          <Link
            href="/dashboard"
            className="auth-nav-dropdown-item"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
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
            role="menuitem"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            Account
          </Link>

          <button
            type="button"
            className="auth-nav-dropdown-item signout"
            onClick={handleSignOut}
            role="menuitem"
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
