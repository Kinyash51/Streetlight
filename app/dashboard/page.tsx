"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { pricing } from "@/lib/pricing";

type Profile = {
  id: string;
  email: string | null;
  username?: string | null;
  created_at?: string | null;
};

type AccountAccess = {
  ebookOwned: boolean;
  membership: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [access, setAccess] = useState<AccountAccess>({
    ebookOwned: false,
    membership: pricing.freeReader.name,
  });
  const [loading, setLoading] = useState(true);

  async function loadProfile(currentUser: User | null) {
    if (!currentUser) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, username, created_at")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      setProfile(null);
      setProfileError(error.message);
      return;
    }

    if (!data) {
      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: currentUser.id,
            email: currentUser.email ?? null,
            username:
              currentUser.user_metadata?.user_name ??
              currentUser.user_metadata?.name ??
              currentUser.email?.split("@")[0] ??
              null,
          },
          { onConflict: "id" }
        )
        .select("id, email, username, created_at")
        .single();

      if (createError) {
        setProfile(null);
        setProfileError(createError.message);
        return;
      }

      setProfile(createdProfile as Profile);
      setProfileError(null);
      return;
    }

    setProfile(data as Profile);
    setProfileError(null);
  }

  async function loadAccountAccess(currentUser: User | null) {
    if (!currentUser) {
      setAccess({
        ebookOwned: false,
        membership: pricing.freeReader.name,
      });
      return;
    }

    const [{ data: orders }, { data: subscriptions }] = await Promise.all([
      supabase
        .from("orders")
        .select("product, status")
        .eq("user_id", currentUser.id)
        .eq("product", pricing.ebook.checkoutProduct)
        .eq("status", "paid"),
      supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", currentUser.id)
        .eq("status", "active"),
    ]);

    const activeSubscription = subscriptions?.find((subscription) =>
      ["supporter", "patron"].includes(String(subscription.tier))
    );
    const membership =
      activeSubscription?.tier === pricing.patron.checkoutProduct
        ? pricing.patron.name
        : activeSubscription?.tier === pricing.supporter.checkoutProduct
          ? pricing.supporter.name
          : pricing.freeReader.name;

    setAccess({
      ebookOwned: Boolean(orders?.length),
      membership,
    });
  }

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await Promise.all([loadProfile(currentUser), loadAccountAccess(currentUser)]);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      Promise.all([loadProfile(currentUser), loadAccountAccess(currentUser)]).finally(() =>
        setLoading(false)
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAccess({
      ebookOwned: false,
      membership: pricing.freeReader.name,
    });
    setLoading(false);
  }

  const profileName =
    profile?.username ?? user?.email?.split("@")[0] ?? "Streetlight Reader";
  const profileEmail = profile?.email ?? user?.email;
  const membershipStatus = access.membership;

  if (loading) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card">
          <p className="section-tag">Streetlight</p>
          <h1>Loading your dashboard...</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card">
          <p className="section-tag">Reader Access</p>
          <h1>You are not signed in.</h1>
          <p className="dashboard-muted">
            Sign in to access your reader dashboard.
          </p>

          <Link href="/login" className="btn-primary">
            Enter Streetlight
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <p className="section-tag">Reader Dashboard</p>
        <h1>Welcome back to Streetlight.</h1>
        <p>
          Continue reading, check your membership, and follow what’s next in the
          Streetlight universe.
        </p>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Your Profile</h2>
          <p>
            <strong>Name:</strong> {profileName}
          </p>
          <p>
            <strong>Email:</strong> {profileEmail}
          </p>
          <p className="dashboard-muted">
            <strong>User ID:</strong> {user.id}
          </p>
          {profileError ? (
            <p className="dashboard-muted">
              Profile details could not be loaded yet. Using your Supabase auth
              account for now.
            </p>
          ) : null}
          <button type="button" className="btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>

        <div className="dashboard-card">
          <h2>Membership</h2>
          <p className="membership-badge">{membershipStatus}</p>
          <p className="dashboard-muted">
            {access.ebookOwned
              ? "The Drowned Streetlamp eBook is unlocked on this account."
              : "The Drowned Streetlamp eBook has not been purchased on this account yet."}
          </p>
        </div>

        <div className="dashboard-card dashboard-wide">
          <h2>Continue Reading</h2>
          <p className="dashboard-muted">
            Start with Chapter One of The Drowned Streetlamp.
          </p>

          <Link href="/read" className="btn-primary">
            Start Reading
          </Link>
        </div>
      </section>
    </main>
  );
}
