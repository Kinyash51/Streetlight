"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { pricing } from "@/lib/pricing";

type Profile = {
  id: string;
  email: string | null;
  username?: string | null;
};

type AccountAccess = {
  ebookOwned: boolean;
  membership: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<AccountAccess>({
    ebookOwned: false,
    membership: pricing.freeReader.name,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        window.location.replace("/login?next=/account");
        return;
      }

      setUser(currentUser);

      const [{ data: profileRow }, { data: orders }, { data: subscriptions }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, email, username")
            .eq("id", currentUser.id)
            .maybeSingle(),
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

      setProfile((profileRow as Profile | null) ?? null);
      setAccess({
        ebookOwned: Boolean(orders?.length),
        membership,
      });
      setLoading(false);
    }

    loadAccount();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  const accountName =
    profile?.username ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Streetlight Reader";
  const accountEmail = profile?.email ?? user?.email ?? "No email found";

  if (loading) {
    return (
      <main className="account-page">
        <section className="account-shell">
          <p className="section-tag">Account</p>
          <h1>Loading your account...</h1>
          <div className="dashboard-loading-line" aria-hidden="true" />
        </section>
      </main>
    );
  }

  return (
    <main className="account-page">
      <section className="account-shell">
        <div className="account-head">
          <p className="section-tag">Account</p>
          <h1>{accountName}</h1>
          <p>{accountEmail}</p>
        </div>

        <section className="account-grid" aria-label="Account settings">
          <article className="reader-panel">
            <p className="reader-kicker">Membership</p>
            <h2>{access.membership}</h2>
            <div className="dashboard-list">
              <div>
                <span>Current tier</span>
                <strong>{access.membership}</strong>
              </div>
              <div>
                <span>eBook</span>
                <strong>{access.ebookOwned ? "Purchased" : "Not purchased"}</strong>
              </div>
              <div>
                <span>Billing portal</span>
                <strong>Coming soon</strong>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary dashboard-action">
              Manage Access
            </Link>
          </article>

          <article className="reader-panel">
            <p className="reader-kicker">Reader Settings</p>
            <h2>Saved on this device</h2>
            <p className="dashboard-muted">
              Reader theme, mode, font size, progress, and highlights are local
              for now. Supabase sync comes after the account backend pass.
            </p>
            <Link href="/highlights" className="btn-ghost dashboard-action">
              View Highlights
            </Link>
          </article>

          <article className="reader-panel account-wide">
            <p className="reader-kicker">Security</p>
            <h2>Session</h2>
            <p className="dashboard-muted">
              You are signed in with Supabase Auth. Use sign out when you are
              done on a shared device.
            </p>
            <div className="reader-actions">
              <Link href="/dashboard" className="btn-primary">
                Back to Dashboard
              </Link>
              <button type="button" className="btn-ghost" onClick={signOut}>
                Sign out
              </button>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
