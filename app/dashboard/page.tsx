"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { pricing } from "@/lib/pricing";
import { DashboardSkeleton } from "@/components/SkeletonLoading";

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

type LocalReaderProgress = {
  chapterSlug: string;
  chapterTitle: string;
  mode: "scroll" | "page";
  pageIndex: number;
  progressPercent: number;
  lastOpenedAt: string;
};

const readerProgressKey = "streetlight-reader-progress";

function readLocalReaderProgress(): LocalReaderProgress | null {
  const savedProgress = window.localStorage.getItem(readerProgressKey);

  if (!savedProgress) {
    return null;
  }

  try {
    const parsedProgress = JSON.parse(savedProgress) as Partial<LocalReaderProgress>;

    if (
      typeof parsedProgress.chapterSlug !== "string" ||
      typeof parsedProgress.chapterTitle !== "string" ||
      typeof parsedProgress.progressPercent !== "number" ||
      typeof parsedProgress.lastOpenedAt !== "string"
    ) {
      return null;
    }

    return {
      chapterSlug: parsedProgress.chapterSlug,
      chapterTitle: parsedProgress.chapterTitle,
      mode: parsedProgress.mode === "page" ? "page" : "scroll",
      pageIndex:
        typeof parsedProgress.pageIndex === "number"
          ? parsedProgress.pageIndex
          : 0,
      progressPercent: Math.min(100, Math.max(0, parsedProgress.progressPercent)),
      lastOpenedAt: parsedProgress.lastOpenedAt,
    };
  } catch {
    window.localStorage.removeItem(readerProgressKey);
    return null;
  }
}

function formatLastOpened(lastOpenedAt: string) {
  const timestamp = new Date(lastOpenedAt).getTime();

  if (Number.isNaN(timestamp)) {
    return "Saved locally";
  }

  const minutesAgo = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (minutesAgo < 1) {
    return "Opened just now";
  }

  if (minutesAgo < 60) {
    return `Opened ${minutesAgo} min ago`;
  }

  const hoursAgo = Math.round(minutesAgo / 60);

  if (hoursAgo < 24) {
    return `Opened ${hoursAgo} hr ago`;
  }

  return "Opened earlier";
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [access, setAccess] = useState<AccountAccess>({
    ebookOwned: false,
    membership: pricing.freeReader.name,
  });
  const [readerProgress, setReaderProgress] =
    useState<LocalReaderProgress | null>(null);
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
    const progressTimer = window.setTimeout(() => {
      setReaderProgress(readLocalReaderProgress());
    }, 0);

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

    return () => {
      window.clearTimeout(progressTimer);
      subscription.unsubscribe();
    };
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
    profile?.username ?? user?.user_metadata?.name ?? "Streetlight Reader";
  const profileEmail = profile?.email ?? user?.email;
  const membershipStatus = access.membership;
  const progressPercent = readerProgress?.progressPercent ?? 0;
  const progressLabel = readerProgress
    ? `${progressPercent}% preview`
    : "Ready to begin";
  const lastOpenedLabel = readerProgress
    ? formatLastOpened(readerProgress.lastOpenedAt)
    : "No saved progress yet";

  if (loading) {
    return <DashboardSkeleton />;
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
    <main className="dashboard-page reader-dashboard dashboard-app">
      <section className="dashboard-app-shell">
        <header className="dashboard-app-welcome">
          <p className="reader-kicker">Reader Home</p>
          <h1>Welcome back, {profileName}.</h1>
          <p>
            Pick up the story, check your access, and unlock more of{" "}
            <em>The Drowned Streetlamp</em> when you are ready.
          </p>
        </header>

        <section className="dashboard-app-grid" aria-label="Streetlight reader dashboard">
          <div className="dashboard-main-stack">
            <article className="reader-panel dashboard-continue-card">
              <p className="reader-kicker">Continue Reading</p>

              <div className="dashboard-book-line">
                <div className="dashboard-book-mark" aria-hidden="true">
                  SL
                </div>

                <div className="dashboard-book-info">
                  <div className="dashboard-book-meta">
                    <span>Chapter One</span>
                    <span className="access-pill">
                      {access.ebookOwned ? "Owned" : "Free preview"}
                    </span>
                  </div>
                  <h2>{pricing.ebook.name}</h2>
                  <p className="dashboard-muted">
                    Start with the free preview, then unlock the full eBook when
                    you want the rest.
                  </p>
                </div>
              </div>

              <div className="dashboard-progress dashboard-progress-compact">
                <div>
                  <span>{lastOpenedLabel}</span>
                  <strong>{progressLabel}</strong>
                </div>
                <div className="dashboard-progress-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(8, progressPercent)}%` }} />
                </div>
              </div>

              <div className="dashboard-actions-row">
                <Link href="/read/chapter-one" className="btn-primary">
                  Continue Chapter One
                </Link>
                {!access.ebookOwned ? (
                  <Link href={pricing.ebook.href} className="btn-ghost">
                    Buy eBook - {pricing.ebook.price}
                  </Link>
                ) : null}
              </div>
            </article>

            <section className="dashboard-bottom-grid" aria-label="Reader updates">
              <article className="reader-panel dashboard-drop-card">
                <p className="reader-kicker">New Drops</p>
                <div className="dashboard-drop-list">
                  <div>
                    <span className="drop-dot" aria-hidden="true" />
                    <span>Chapter One</span>
                    <strong>Live now</strong>
                  </div>
                  <div>
                    <span className="drop-dot" aria-hidden="true" />
                    <span>Reader progress</span>
                    <strong>Saving locally</strong>
                  </div>
                  <div>
                    <span className="drop-dot dim" aria-hidden="true" />
                    <span>Supporter notes</span>
                    <strong>Coming soon</strong>
                  </div>
                </div>
              </article>

              <article className="reader-panel dashboard-highlights-card">
                <div>
                  <p className="reader-kicker">Highlights</p>
                  <h3>Saved passages</h3>
                  <p className="dashboard-muted">
                    Select a passage in Chapter One, save it, and return to it
                    from your highlights library.
                  </p>
                </div>
                <Link href="/highlights" className="btn-ghost dashboard-action">
                  View Highlights
                </Link>
              </article>
            </section>
          </div>

          <aside className="dashboard-side-stack">
            <article className="reader-panel dashboard-tier-card">
              <div className="dashboard-tier-top">
                <div>
                  <p className="reader-kicker">Your Tier</p>
                  <h3>{membershipStatus}</h3>
                </div>
                <span className="access-pill">Active</span>
              </div>

              <div className="dashboard-thin-divider" />

              <div className="access-list">
                <div>
                  <span>Membership</span>
                  <strong>{membershipStatus}</strong>
                </div>
                <div>
                  <span>eBook</span>
                  <strong>{access.ebookOwned ? "Purchased" : "Not purchased"}</strong>
                </div>
              </div>

              <p className="dashboard-muted dashboard-small-note">
                Supporter and purchase status updates here after Stripe syncs to
                Supabase.
              </p>
            </article>

            <article className="reader-panel dashboard-unlock-card">
              <p className="reader-kicker">Unlock More</p>
              <div className="unlock-list">
                {!access.ebookOwned ? (
                  <Link href={pricing.ebook.href}>
                    <span>Own the eBook</span>
                    <strong>{pricing.ebook.price}</strong>
                  </Link>
                ) : null}
                <Link href={pricing.supporter.href}>
                  <span>Become Supporter</span>
                  <strong>{pricing.supporter.price}</strong>
                </Link>
                <span className="dashboard-disabled-row">
                  <span>Become Patron</span>
                  <strong>{pricing.patron.price}</strong>
                </span>
              </div>
            </article>

            <article className="reader-panel account-panel dashboard-account-card">
              <p className="reader-kicker">Account</p>
              <p>{profileEmail}</p>
              {profileError ? (
                <p className="dashboard-muted">
                  Profile details could not be loaded yet. Using your Supabase
                  auth account for now.
                </p>
              ) : null}
              <div className="dashboard-account-actions">
                <Link href="/account" className="btn-primary">
                  Account Settings
                </Link>
                <button type="button" className="btn-ghost" onClick={signOut}>
                  Sign out
                </button>
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
