"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { pricing } from "@/lib/pricing";
import { supabase } from "@/lib/supabase-client";

function getDisplayName(user: User) {
  return (
    user.user_metadata?.username ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Reader"
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadMembership(currentUser: User | null) {
      if (!currentUser) {
        setTier(null);
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", currentUser.id)
        .in("status", ["active", "trialing"])
        .maybeSingle();

      if (!alive) {
        return;
      }

      setTier(data?.tier ?? null);
    }

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!alive) {
        return;
      }

      setUser(currentUser);
      await loadMembership(currentUser);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setOpen(false);
      loadMembership(currentUser);
      setLoading(false);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setTier(null);
    setOpen(false);
    window.location.href = "/";
  }

  if (loading) {
    return <div className="auth-nav-skeleton" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link href="/login" className="auth-nav-signin">
        Sign In
      </Link>
    );
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(displayName) || "SL";
  const tierLabel =
    tier === pricing.patron.checkoutProduct
      ? pricing.patron.name
      : tier === pricing.supporter.checkoutProduct
        ? pricing.supporter.name
        : null;

  return (
    <div className="auth-nav" ref={menuRef}>
      <button
        type="button"
        className="auth-nav-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open account menu"
      >
        <span className="auth-nav-avatar">{initials}</span>
        {tierLabel ? (
          <span className={`auth-nav-badge ${tier}`}>{tierLabel}</span>
        ) : null}
        <span className={`auth-nav-chevron ${open ? "open" : ""}`}>⌄</span>
      </button>

      {open ? (
        <div className="auth-nav-dropdown">
          <div className="auth-nav-dropdown-header">
            <span className="auth-nav-dropdown-name">{displayName}</span>
            <span className="auth-nav-dropdown-email">{user.email}</span>
          </div>
          <Link
            href="/dashboard"
            className="auth-nav-dropdown-item"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/account"
            className="auth-nav-dropdown-item"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/checkout"
            className="auth-nav-dropdown-item"
            onClick={() => setOpen(false)}
          >
            Manage Access
          </Link>
          <button
            type="button"
            className="auth-nav-dropdown-item signout"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
